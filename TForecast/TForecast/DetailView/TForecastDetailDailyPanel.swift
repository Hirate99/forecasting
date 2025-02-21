//
//  TForecastDetailDailyEntryView.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/27.
//

import SwiftUI

struct DailyWeatherSlot: View {
    let icon: String
    let value: String
    let desc: String
    let width: Double
    
    var body: some View {
        VStack {
            VStack {
                Image(icon)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 75, height: 75)
                Text(value)
                    .padding([.top, .bottom], 6)
                    .fixedSize(horizontal: false, vertical: true)
                    .multilineTextAlignment(.center)
                Text(desc)
            }
            .padding(12)
        }
        .frame(width: width, height: 170)
        .background(Color.white.opacity(0.3))
        .cornerRadius(5)
        .overlay {
            RoundedRectangle(cornerRadius: 5)
                .stroke(Color.white, lineWidth: 1)
        }
    }
}

struct TForecastDetailDailyPanel: View {
    let weather: TForecastTimelineInterval
    
    var body: some View {
        GeometryReader { geometry in
            if (geometry.size.width > 0) {
                let width = (geometry.size.width - 36) / 3
                Grid(alignment: .center, verticalSpacing: 20) {
                    GridRow {
                        DailyWeatherSlot(
                            icon: "WindSpeed",
                            value: "\(weather.values.windSpeed) mph",
                            desc: "Wind Speed",
                            width: width
                        )
                        DailyWeatherSlot(
                            icon: "Pressure",
                            value: "\(weather.values.pressureSeaLevel) inHG",
                            desc: "Pressure",
                            width: width
                        )
                        DailyWeatherSlot(
                            icon: "Precipitation",
                            value: "\(weather.values.precipitationProbability) %",
                            desc: "Precipitation",
                            width: width
                        )
                    }
                    GridRow {
                        DailyWeatherSlot(
                            icon: "Temperature",
                            value: "\(weather.values.temperature) °F",
                            desc: "Temperature",
                            width: width
                        )
                        DailyWeatherSlot(
                            icon: WEATHER_CODES[weather.values.weatherCode] ?? "",
                            value: WEATHER_CODES[weather.values.weatherCode] ?? "",
                            desc: "",
                            width: width
                        )
                        DailyWeatherSlot(
                            icon: "Humidity",
                            value: "\(weather.values.humidity) %",
                            desc: "Humidity",
                            width: width
                        )
                    }
                    GridRow {
                        DailyWeatherSlot(
                            icon: "Visibility",
                            value: "\(weather.values.visibility) mi",
                            desc: "Visibility",
                            width: width
                        )
                        DailyWeatherSlot(
                            icon: "CloudCover",
                            value: "\(weather.values.cloudCover) %",
                            desc: "Cloud Cover",
                            width: width
                        )
                        DailyWeatherSlot(
                            icon: "UVIndex",
                            value: "\(weather.values.uvIndex ?? 0)",
                            desc: "UVIndex",
                            width: width
                        )
                    }
                }
                .frame(width: geometry.size.width, height: geometry.size.height)
            }
        }
    }
}
