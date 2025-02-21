//
//  Utils.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/26.
//

import SwiftUI

func blurInput() {
    UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
}

func buildTweetText(byTemperature temperature: Double, city: String, weatherCode: Int) -> String {
    return "The current temperture at \(city) is \(temperature.formatted(places: 0))°F. The weather conditions are \(WEATHER_CODES[weatherCode] ?? "") #CSCI571WeatherSearch"
}

func shareToTwitter(for text: String) {
    guard let tweet = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else {
        return
    }
    
    guard let url = URL(string: "https://twitter.com/intent/tweet?text=\(tweet)") else {
        return
    }
    
    UIApplication.shared.open(url)
}

class StructWrapper<T>: NSObject {
    let value: T

    init(_ value: T) {
        self.value = value
    }
}

func getRootView() -> UIView? {
    UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        .filter { $0.activationState == .foregroundActive }
        .first?
        .keyWindow?
        .rootViewController?
        .view
}
