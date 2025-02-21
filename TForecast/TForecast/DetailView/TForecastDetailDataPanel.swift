//
//  TForecastDetailDataPanel.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/28.
//

import SwiftUI

import SwiftyJSON
import Highcharts

struct TWeatherDataField {
    var field: String
    var key: String
    var color: Color
    var suffix: String = "%"
}

struct TWeatherDisplayDataField {
    let field: String
    let icon: String
    let color: Color
    let suffix: String
    let data: Double
}

let weatherDataFields: [TWeatherDataField] = [
    .init(
        field: "Precipitation",
        key: "precipitationProbability",
        color: .init(red: 137 / 255, green: 206 / 255, blue: 64 / 255)
    ),
    .init(
        field: "Humidity",
        key: "humidity",
        color: .init(red: 127 / 255, green: 179 / 255, blue: 250 / 255)
    ),
    .init(
        field: "Cloud Cover",
        key: "cloudCover",
        color: .init(red: 239 / 255, green: 121 / 255, blue: 118 / 255)
    )
]

struct DataChartView: View {
    let data: [TWeatherDisplayDataField]
    
    private var chartOptions: HIOptions {
        let options = HIOptions()
        
        let defaultWidth = 16
        let height = 100
        
        let chart = HIChart()
        chart.type = "solidgauge"
        chart.backgroundColor = .init(uiColor: UIColor.clear)
        chart.height = "\(height)%"
        options.chart = chart
        
        let title = HITitle()
        title.text = "Weather Data"
        let titleStyle = HICSSObject()
        titleStyle.fontWeight = "400"
        title.style = titleStyle
        options.title = title
        
        let pane = HIPane()
        pane.startAngle = 0
        pane.endAngle = 360
        pane.background = data.enumerated().map { i, field in
            let background = HIBackground()
            background.borderWidth = 0
            background.backgroundColor = .init(uiColor: UIColor(field.color.opacity(0.3)))
            background.outerRadius = "\(height - i * defaultWidth - i)%"
            background.innerRadius = "\(height - (i + 1) * defaultWidth - i)%"
            
            return background
        }
        options.pane = pane
        
        let plotOptions = HIPlotOptions()
        let solidgauge = HISolidgauge()
        solidgauge.linecap = "round"
        let dataLabel = HIDataLabels()
        dataLabel.enabled = false
        solidgauge.dataLabels = [dataLabel]
        solidgauge.rounded = true
        solidgauge.stickyTracking = false
        plotOptions.solidgauge = solidgauge
        options.plotOptions = plotOptions
        
        let yAxis = HIYAxis()
        yAxis.min = 0
        yAxis.max = 100
        yAxis.lineWidth = 0
        yAxis.tickPositions = []
        options.yAxis = [yAxis]
        
        let series: [HISeries] = data.enumerated().map { i, field in
            let series = HISeries()
            series.name = field.field
            series.showInLegend = 0
            let seriesData = HIData()
            seriesData.color = .init(uiColor: UIColor(field.color))
            seriesData.radius = "\(height - i * defaultWidth - i)%"
            seriesData.innerRadius = "\(height - (i + 1) * defaultWidth - i)%"
            seriesData.y = .init(value: field.data)
            
            series.data = [seriesData]
            
            return series
        }
        
        options.series = series

        return options
    }
    
    var body: some View {
        TChartView(options: chartOptions)
    }
}

struct TForecastDetailDataPanel: View {
    let weather: TForecastValues
    
    var datafields: [TWeatherDisplayDataField]? {
        guard let jsonData = try? JSONEncoder().encode(weather) else {
            return nil
        }
        if let dict = try? JSON(data: jsonData) {
            return weatherDataFields.map { field in
                .init(
                    field: field.field,
                    icon: field.field.components(separatedBy: " ").joined(),
                    color: field.color,
                    suffix: field.suffix, data: dict[field.key].doubleValue
                )
            }
        }
        return nil
    }
    
    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 36) {
                Grid(verticalSpacing: 16) {
                    if let fields = datafields {
                        ForEach(fields, id: \.field) { field in
                            GridRow {
                                Image(field.icon)
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 40, height: 40)
                                Text("\(field.field): ")
                                    .frame(width: 180, alignment: .trailing)
                                Text("\(field.data.formatted(places: 0)) \(field.suffix)")
                            }
                        }
                    }
                }
                .frame(width: geometry.size.width - 32)
                .padding([.top, .bottom], 8)
                .background(Color.white.opacity(0.3))
                .cornerRadius(10)
                .overlay {
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.white, lineWidth: 1)
                }
              
                if let datafields = datafields {
                    DataChartView(data: datafields)
                        .frame(height: 400)
                        .background(Color.white)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}
