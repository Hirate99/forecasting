//
//  TForecastSearchBar.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/25.
//

import SwiftUI
import SwiftSpinner

struct TForecastSearchOptions: View {
    var places: [GMPlace] = []
    let onSearched: (GMPlace, TForecastModel) -> Void
    
    @State private var path = NavigationPath()
    
    var body: some View {
        let count = places.count
        if !places.isEmpty {
            VStack {
                ForEach(Array(places.enumerated()), id: \.offset) { i, place in
                    VStack{
                        Button(action: {
                            fetchForecastBy(city: place.city, state: place.state, withCache: false) { response in
                                switch (response) {
                                case.success(let weather):
                                    onSearched(place, weather)
                                case.failure(let error):
                                    print(error)
                                }
                            }
                        }){
                            HStack {
                                Text("\(place.city), \(place.state)").foregroundStyle(Color.black)
                                Spacer()
                            }
                            .padding(.leading, 12)
                            .padding(.top, i == 0 ? 5 : 0)
                            .padding(.bottom, i == count - 1 ? 8 : 0)
                        }
                        .padding(.vertical, 6)
                    }
                    if (i < count - 1) {
                        Divider().padding(.leading, 12)
                    }
                }
            }
            .frame(width: UIScreen.main.bounds.width - 20)
            .background(Color.white.opacity(0.9))
            .clipShape(
                .rect(
                    topLeadingRadius: 0,
                    bottomLeadingRadius: 10,
                    bottomTrailingRadius: 10,
                    topTrailingRadius: 0
                )
            )
        }
    }
}

struct TForecastSearchBar: View {
    let onSearched: (GMPlace, TForecastModel) -> Void
    
    @State private var searchText: String = ""
    @State private var predictedPlaces: [GMPlace] = []
    
    @State private var searchFulfilled: Bool = false
    
    @FocusState private var isFocused: Bool
    
    func autocomplete(for query: String) {
        guard !query.isEmpty else {
            predictedPlaces = []
            return
        }
        
        placeAutocomplete(for: query) { places in
            predictedPlaces = places
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            Divider()
                .padding(0)
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                    .padding([.leading], 8)
                
                TextField("Enter City Name", text: $searchText)
                    .focused($isFocused)
                    .textFieldStyle(PlainTextFieldStyle())
                    .padding(.leading, 2)
                    .padding([.top, .bottom], 8)
                    .cornerRadius(10)
                
                if !searchText.isEmpty {
                    Button(action: {
                        searchText = ""
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }.padding(.trailing, 8)
                }
            }
            .cornerRadius(10)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .padding([.leading, .trailing], 10)
            .padding([.top, .bottom], 8)
            .onChange(of: searchText) { _, newValue in
                autocomplete(for: newValue)
            }
            .background(Color.white)
            .overlay(alignment: .top) {
                GeometryReader { geometry in
                    if (isFocused) {
                        TForecastSearchOptions(places: predictedPlaces) { (place, model) in
                            onSearched(place, model)
                            searchText = ""
                            predictedPlaces = []
                        }
                        .offset(x: 10, y: geometry.size.height)
                    }
                }
            }
            Divider()
                .padding(0)
        }
        .background(Color.white)
    }
}
