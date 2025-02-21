//
//  TForecastModel.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/25.
//

struct TForecastValues: Codable {
    let cloudCover: Double
    let humidity: Double
    let moonPhase: Double
    let precipitationProbability: Double
    let precipitationType: Double
    let pressureSeaLevel: Double
    let sunriseTime: String
    let sunsetTime: String
    let temperature: Double
    let temperatureApparent: Double
    let temperatureMax: Double
    let temperatureMin: Double
    let uvIndex: Int?
    let visibility: Double
    let weatherCode: Int
    let windDirection: Double
    let windSpeed: Double
}

struct TForecastTimelineInterval: Codable {
    let startTime: String
    let values: TForecastValues
}

struct TForecastTimeline: Codable {
    let endTime: String
    let intervals: [TForecastTimelineInterval]
    let startTime: String
    let timestep: String
}

struct TForecastLocation: Codable {
    let lat: String
    let lon: String
}

struct TForecastModel: Codable {
    let forecast: Forecast
    let location: TForecastLocation
    let realtime: TForecastTimeline
    
    struct Forecast: Codable {
        let timelines: Timelines
        
        struct Timelines: Codable {
            let daily: TForecastTimeline
            let hourly: TForecastTimeline
        }
    }
}

let WEATHER_CODES: [Int: String] = [
    1000: "Clear",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    1001: "Cloudy",
    2000: "Fog",
    2100: "Light Fog",
    4000: "Drizzle",
    4001: "Rain",
    4200: "Light Rain",
    4201: "Heavy Rain",
    5000: "Snow",
    5001: "Flurries",
    5100: "Light Snow",
    5101: "Heavy Snow",
    6000: "Freezing Drizzle",
    6001: "Freezing Rain",
    6200: "Light Freezing Rain",
    6201: "Heavy Freezing Rain",
    7000: "Ice Pellets",
    7101: "Heavy Ice Pellets",
    7102: "Light Ice Pellets",
    8000: "Thunderstorm"
]
