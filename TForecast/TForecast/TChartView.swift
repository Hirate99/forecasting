//
//  TChartView.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/27.
//

import SwiftUI
import UIKit

import Highcharts

struct TChartView: UIViewRepresentable {
    
    var options: HIOptions
    
    func makeUIView(context: Context) -> HIChartView {
        let chart = HIChartView()
        chart.options = options
        return chart
    }
    
    func updateUIView(_ uiView: HIChartView, context: Context) {
        uiView.options = options
    }
    
}
