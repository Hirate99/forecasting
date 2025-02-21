//
//  TForecastView.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/25.
//

import SwiftUI
import SwiftData

func getISODate(dateStr: String) -> (formatter: DateFormatter, date: Date? ){
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US")
    formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
    guard let date = formatter.date(from: dateStr) else {
        return (formatter, nil)
    }
    return (formatter, date)
}

func formatDate(dateStr: String) -> String {
    guard case let (formatter, date?) = getISODate(dateStr: dateStr) else {
        return ""
    }
    formatter.dateFormat = "MM/dd/yyyy"
    formatter.timeZone = TimeZone(identifier: "America/Los_Angeles")
    return formatter.string(from: date)
}

func formatLocalTime(dateStr: String) -> String {
    guard case let (formatter, date?) = getISODate(dateStr: dateStr) else {
        return ""
    }
    formatter.dateFormat = "H:mm"
    formatter.timeZone = TimeZone(identifier: "America/Los_Angeles")
    return formatter.string(from: date)
}

struct TForecastScrollPanel: View {
    let intervals: [TForecastTimelineInterval]
    
    var body: some View {
        ForEach(Array(intervals.enumerated()), id: \.element.startTime) { i, weather in
            let values = weather.values;
            
            let desc = WEATHER_CODES[values.weatherCode] ?? ""
            let date = formatDate(dateStr: values.sunriseTime)
            let sunriseTime = formatLocalTime(dateStr: values.sunriseTime)
            let sunsetTime = formatLocalTime(dateStr: values.sunsetTime)
            let imageSize = 38.0
            HStack {
                Text(date)
                    .padding(.leading, 3)
                    .frame(width: 100)
                Image(desc)
                    .resizable()
                    .scaledToFit()
                    .frame(width: imageSize, height: imageSize, alignment: .center)
                Spacer()
                Text(sunriseTime)
                Image("sun-rise")
                    .resizable()
                    .scaledToFit()
                    .frame(width: imageSize, height: imageSize, alignment: .center)
                Spacer()
                Text(sunsetTime)
                Image("sun-set")
                    .resizable()
                    .scaledToFit()
                    .frame(width: imageSize, height: imageSize, alignment: .center)
            }
            .padding([.top, .bottom], 1)
            .padding([.leading, .trailing], 6)
            if (i < intervals.count - 1) {
                Divider().padding(0).padding(.leading, 12)
            }
        }
    }
}

struct TForecastView: View {
    let forecast: TForecastModel
    let place: GMPlace
    let isMainScreen: Bool
    
    @Environment(\.modelContext) private var modelContext
    @Query var favorites: [TFavoriteItem]
    
    @EnvironmentObject var navigationPathManger: TNavigationPathManager
    
    func checkIsFavorite() -> Bool {
        favorites.contains { item in
            item.id == place.id
        }
    }
    
    func favorite() {
        modelContext.insert(TFavoriteItem(city: place.city, state: place.state))
        getRootView()?.makeToast("\(place.city) was added to the Favorite List", duration: 2.0)
    }
    
    func unfavorite() {
        let target = favorites.first {
            $0.id == place.id
        }
        guard let target = target else {
            return
        }
        modelContext.delete(target)
        try? modelContext.save()
        getRootView()?.makeToast("\(place.city) was removed from the Favorite List", duration: 2.0)
    }
    
    var body: some View {
        VStack(alignment: .leading) {
            if let values = forecast.realtime.intervals.first?.values {
                if (!isMainScreen) {
                    HStack {
                        let favoriteBtnSize = 24.0
                        if (checkIsFavorite()) {
                            Button(action: {
                                unfavorite()
                            }) {
                                Image("close-circle")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: favoriteBtnSize, height: favoriteBtnSize)
                            }
                            .frame(alignment: .trailing)
                            
                        } else {
                            Button(action: {
                                favorite()
                            }) {
                                Image("plus-circle")
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: favoriteBtnSize, height: favoriteBtnSize)
                            }
                            .frame(alignment: .trailing)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .padding(.bottom, 4)
                }
                
                HStack {
                    Image(WEATHER_CODES[values.weatherCode] ?? "")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 120, height: 120)
                        .padding()
                    VStack(alignment: .leading) {
                        Text("\(Int(values.temperature.rounded()))°F")
                            .font(.system(size: 26))
                            .fontWeight(.bold)
                        Text(WEATHER_CODES[values.weatherCode] ?? "")
                            .font(.system(size: 22))
                            .padding(.top, 3.5)
                            .padding(.bottom, 6)
                        
                        Text(place.city)
                            .font(.system(size: 24))
                            .fontWeight(.bold)
                    }
                    Spacer()
                }
                .padding([.top, .bottom], 4)
                .padding([.leading, .trailing], 3)
                .background(Color.white.opacity(0.36))
                .frame(maxWidth: .infinity)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.white, lineWidth: 2)
                )
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .onTapGesture {
                    blurInput()
                    navigationPathManger.path.append(ForcastDetailParam(weather: forecast, place: place))
                }
                
                HStack {
                    let detailPadding = 12.0
                    
                    VStack {
                        Text("Humidity")
                        Image("Humidity")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 50, height: 50)
                            .padding([.top, .bottom], detailPadding)
                        Text("\(values.humidity.formatted(places: 1)) %")
                    }
                    Spacer()
                    VStack {
                        Text("Wind Speed")
                        Image("WindSpeed")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 50, height: 50)
                            .padding([.top, .bottom], detailPadding)
                        Text("\(values.windSpeed.formatted(places: 2)) mph")
                    }
                    Spacer()
                    VStack {
                        Text("Visibility")
                        Image("Visibility")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 50, height: 50)
                            .padding([.top, .bottom], detailPadding)
                        Text("\(values.visibility.formatted(places: 1)) mi")
                    }
                    Spacer()
                    VStack {
                        Text("Pressure")
                        Image("Pressure")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 50, height: 50)
                            .padding([.top, .bottom], detailPadding)
                        Text("\(values.pressureSeaLevel.formatted(places: 1)) inHg")
                    }
                }
                .frame(maxWidth: .infinity)
                .padding([.top, .bottom], 30)
                ScrollView {
                    TForecastScrollPanel(intervals: forecast.forecast.timelines.daily.intervals)
                }
                .background(Color.white.opacity(0.6))
                .frame(maxWidth: .infinity, maxHeight: 275)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.white, lineWidth: 2)
                )
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            Spacer()
        }
        .padding(.top, isMainScreen ? 40 : 4)
        .frame(maxWidth: .infinity)
        .padding([.leading, .trailing], 20)
    }
}
