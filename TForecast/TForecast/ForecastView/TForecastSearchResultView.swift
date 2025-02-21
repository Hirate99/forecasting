//
//  TForecastSearchResultView.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/26.
//

import SwiftUI

struct SearchedCityWeather: Hashable {
    let weather: TForecastModel
    let place: GMPlace
    
    var id: String {
        "\(place.id)-\(weather.realtime.startTime)"
    }
    
    static func == (lhs: SearchedCityWeather, rhs: SearchedCityWeather) -> Bool {
        return lhs.id == rhs.id
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

struct TForecastSearchResultView: View {
    let weather: TForecastModel
    let place: GMPlace
    
    @EnvironmentObject var navigationPathManager: TNavigationPathManager
    
    var body: some View {
        ZStack {
            TForecastBackground()
            VStack {
                TForecastView(forecast: weather, place: place, isMainScreen: false)
            }
            .padding(.top, 8)
        }
        .toolbarBackground(Color.white, for: .navigationBar)
        .toolbarBackgroundVisibility(.visible, for: .navigationBar)
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle(place.city)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: {
                    guard let values = weather.realtime.intervals.first?.values else {
                        return
                    }
                    shareToTwitter(
                        for: buildTweetText(
                            byTemperature: values.temperature,
                            city: place.city,
                            weatherCode: values.weatherCode
                        )
                    )
                }) {
                    Image("twitter")
                        .renderingMode(.template)
                        .foregroundStyle(.blue)
                }
            }
        }
        .background(Color.white)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .environmentObject(navigationPathManager)
    }
}
