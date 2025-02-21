//
//  TForecastDetialWeeklyPanel.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/27.
//

import SwiftUI

import Highcharts

struct TemperatureChartView: View {
    let timeline: TForecastTimeline
    
    private var chartOptions: HIOptions {
        let options = HIOptions()
        
        let chart = HIChart()
        chart.type = "arearange"
        options.chart = chart
        
        let title = HITitle()
        title.text = "Temperature Variation by Day"
        let titleStyle = HICSSObject()
        titleStyle.fontWeight = "400"
        title.style = titleStyle
        options.title = title
        
        let time = HITime()
        time.timezone = "America/Los_Angeles"
        options.time = time
        
        let legend = HILegend()
        legend.enabled = false
        options.legend = legend
        
        let xAixs = HIXAxis()
        options.xAxis = [xAixs]
        
        let yAixs = HIYAxis()
        let yTitle = HITitle()
        yTitle.text = "Temperatures"
        yAixs.title = yTitle
        options.yAxis = [yAixs]
        
        let series = HISeries()
        series.name = "Temperatures"
        series.type = "arearange"
        
        let seriesColor: HIColor = .init(linearGradient: [
            "x1": 0,
            "x2": 0,
            "y1": 0,
            "y2": 1,
        ], stops: [
            [0, "rgb(222, 161, 72)"],
            [1, "rgb(78, 158, 246)"],
        ])
        
        series.color = seriesColor
        series.data = timeline.intervals.enumerated().map { i, weather in
            [
                weather.startTime,
                weather.values.temperatureMin,
                weather.values.temperatureMax
            ]
        }
        let markerColor: HIColor = .init(uiColor: UIColor.black)
        let marker = HIMarker()
        marker.fillColor = markerColor
        series.marker = marker
        options.series = [series]
        
        return options
    }
    
    var body: some View {
        TChartView(options: chartOptions)
            .frame(height: 320)
            .padding(.top, 60)
    }
}

struct TForecastDetailWeeklyPanel: View {
    let temperature: String
    let weatherCode: Int
    let timeline: TForecastTimeline
    
    var body: some View {
        let weatherDesc = WEATHER_CODES[weatherCode] ?? ""
        
        GeometryReader { geometry in
            VStack {
                HStack {
                    Image(weatherDesc)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 130, height: 130)
                        .padding(.leading, 20)
                    Spacer()
                    VStack {
                        Text(weatherDesc)
                            .font(.system(size: 30))
                            .padding(.bottom, 10)
                        Text("\(temperature) °F")
                            .font(.system(size: 50))
                    }
                    .padding([.top, .bottom], 30)
                    Spacer()
                }
                .background(Color.white.opacity(0.3))
                .cornerRadius(10)
                .overlay {
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.white, lineWidth: 2)
                }
                .frame(width: geometry.size.width - 36)
                
                TemperatureChartView(timeline: timeline)
            }
            .frame(alignment: .center)
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        
    }
}
