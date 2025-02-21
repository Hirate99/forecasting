//
//  TForecastDetailView.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/27.
//

import SwiftUI

struct ForcastDetailParam: Hashable {
    let weather: TForecastModel
    let place: GMPlace
    
    var id: String {
        "\(place.id)-\(weather.realtime.startTime)"
    }
    
    static func == (lhs: ForcastDetailParam, rhs: ForcastDetailParam) -> Bool {
        return lhs.id == rhs.id
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}


struct TForecastDetailView: View {
    let weather: TForecastModel
    let place: GMPlace
    
    enum DetailTab {
        case today
        case weekly
        case data
    }
    
    @State private var selectedTab: DetailTab = .today
    
    var body: some View {
        ZStack {
            TForecastBackground()
            VStack {
                if let value = weather.realtime.intervals.first {
                    switch (selectedTab) {
                    case.today:
                        TForecastDetailDailyPanel(weather: value)
                    case.weekly:
                        TForecastDetailWeeklyPanel(
                            temperature: value.values.temperature.formatted(places: 0),
                            weatherCode: value.values.weatherCode,
                            timeline: weather.forecast.timelines.daily
                        )
                    case.data:
                        TForecastDetailDataPanel(weather: value.values)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .top)
        }
        .toolbarBackground(Color.white)
        .toolbarBackground(Color.white, for: .bottomBar)
        .toolbarBackgroundVisibility(.visible, for: .bottomBar)
        .toolbarBackgroundVisibility(.visible, for: .navigationBar)
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle(place.city)
        .background(Color.clear)
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
        .toolbar {
            ToolbarItemGroup(placement: .bottomBar) {
                VStack {
                    Spacer()
                    GeometryReader {geometry in
                        let width = geometry.size.width * 0.3
                
                        HStack {
                            Spacer()
                            
                            VStack {
                                Button(action: {
                                    selectedTab = .today
                                }) {
                                    VStack {
                                        Image("Today_Tab").renderingMode(.template)
                                        Text("TODAY").font(.caption)
                                    }
                                }
                                .foregroundStyle(selectedTab == .today ? .blue: .gray)
                            }
                            .frame(width: width)
                            
                            VStack {
                                Button(action: {
                                    selectedTab = .weekly
                                }) {
                                    VStack {
                                        Image("Weekly_Tab").renderingMode(.template)
                                        Text("WEEKLY").font(.caption)
                                    }
                                }
                                .foregroundStyle(selectedTab == .weekly ? .blue: .gray)
                            }
                            .frame(width: width)
                            
                            VStack {
                                Button(action: {
                                    selectedTab = .data
                                }) {
                                    VStack {
                                        Image("Weather_Data_Tab").renderingMode(.template)
                                        Text("WEATHER DATA").font(.caption)
                                    }
                                }
                                .foregroundStyle(selectedTab == .data ? .blue: .gray)
                            }
                            .frame(width: width)
                            
                            Spacer()
                        }
                    }
                }
                .frame(height: 60)
            }
        }
        .background(Color.white)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
