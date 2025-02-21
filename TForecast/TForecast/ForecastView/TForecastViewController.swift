//
//  TForecastViewController.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/26.
//

import SwiftUI

struct TForecastViewController: View {
    let place: GMPlace
    @State private var forcast: TForecastModel?
    
    var body: some View {
        HStack {
            if let forecast = forcast {
                TForecastView(forecast: forecast, place: place, isMainScreen: false)
            }
        }
        .onAppear {
            fetchForecastBy(city: place.city, state: place.state, withCache: true) { response in
                switch (response) {
                case.success(let weather):
                    forcast = weather
                case.failure(let error):
                    print(error)
                }
            }
        }
    }
}
