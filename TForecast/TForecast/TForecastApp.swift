//
//  TForecastApp.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/25.
//

import SwiftUI
import SwiftData
import Combine
import CoreLocation

import SwiftSpinner
import Toast_Swift

struct ForecastMainPanel: View {
    let forecast: TForecastModel
    let city: String
    
    @Query var favoriteCities: [TFavoriteItem]
    
    @State private var location: Int = 0
    
    var body: some View {
        GeometryReader { geometry in
            let containerWidth = geometry.size.width
            
            VStack {
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 0) {
                        VStack {
                            TForecastView(forecast: forecast, place: .init(city: city, state: ""), isMainScreen: true)
                        }
                        .frame(width: geometry.size.width)
                        ForEach(favoriteCities.sorted(by: { $0.timestamp < $1.timestamp })) { place in
                            VStack {
                                TForecastViewController(place: .init(city: place.city, state: place.state))
                            }
                            .frame(width: geometry.size.width)
                        }
                    }
                    .background(GeometryReader { proxy -> Color in
                        DispatchQueue.main.async {
                            let offset = -proxy.frame(in: .named("scroll")).origin.x
                            location = Int((offset / containerWidth).rounded())
                        }
                        return Color.clear
                    })
                    .scrollTargetLayout()

                }
                .scrollTargetBehavior(.viewAligned)
                .coordinateSpace(name: "scroll")
                
                HStack {
                    ForEach(0...favoriteCities.count, id: \.self) { i in
                        Circle()
                            .fill(i == location ? Color.white : Color.gray.opacity(0.6))
                            .frame(width: 8, height: 8)
                    }
                }
            }
        }
    }
}

@main
struct TForecastApp: App {
    let locationManager = TLocationManager.shared
    
    @State private var forecast: TForecastModel?
    @State private var prevLocation: CLLocation?
    @State private var city: String = ""
    
    @State private var cancellables = Set<AnyCancellable>()
    
    @State private var searchBarHeight: CGFloat = 0
    
    @State private var searchedResult: TForecastModel?
    @State private var searchedCity: GMPlace?
    
    @StateObject private var navigationPathManager = TNavigationPathManager()
    
    var body: some Scene {
        WindowGroup {
            NavigationStack(path: $navigationPathManager.path) {
                ZStack {
                    TForecastBackground()
                    VStack {
                        TForecastSearchBar(onSearched: { place, weather in
                            navigationPathManager.path.append(SearchedCityWeather(weather: weather, place: place))
                        })
                        .zIndex(1)
                        .offset(y: 0)
                        
                        if let forecast = forecast {
                            ForecastMainPanel(forecast: forecast, city: city)
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                }
                .toolbar(.hidden)
                .onAppear {
                    locationManager.$location.sink { _location in
                        guard let location = _location else {
                            return
                        }
                        if (prevLocation?.coordinate.latitude == location.coordinate.latitude && prevLocation?.coordinate.longitude == location.coordinate.longitude) {
                            return
                        }
                        prevLocation = location
                        
                        let geocoder = CLGeocoder()
                        geocoder.reverseGeocodeLocation(location, preferredLocale: Locale(identifier: "en-US")) { (_placemarks, _) in
                            if let placemarks = _placemarks {
                                city = placemarks.first?.locality ?? ""
                            }
                        }
                        
                        fetchForecast(params: .init(lat: location.coordinate.latitude, lon: location.coordinate.longitude, location: nil, city: nil, state: nil)) { response in
                            SwiftSpinner.hide()
                            switch (response.result) {
                            case.success(let data):
                                forecast = data
                            case.failure(let error):
                                getRootView()?.makeToast("Failed to retrieve weather details, please try again later")
                                print(error)
                            }
                        }
                    }.store(in: &cancellables)
                    
                    locationManager.requestLocation()
                }
                .onChange(of: city, { _, city in
                    if (forecast != nil) {
                        return
                    }
                    SwiftSpinner.show("Fetching Wether Details for \(city)...")
                })
                .onTapGesture {
                    blurInput()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .navigationTitle("Weather")
                .navigationDestination(for: SearchedCityWeather.self, destination: { dest in
                    TForecastSearchResultView(weather: dest.weather, place: dest.place)
                        .environmentObject(navigationPathManager)
                })
                .navigationDestination(for: ForcastDetailParam.self, destination: { dest in
                    TForecastDetailView(weather: dest.weather, place: dest.place)
                })
                .environmentObject(navigationPathManager)
            }
        }
        .modelContainer(for: [TFavoriteItem.self])
    }
}
