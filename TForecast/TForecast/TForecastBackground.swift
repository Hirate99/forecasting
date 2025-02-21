//
//  TForecastBackground.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/26.
//

import SwiftUI

struct TForecastBackground: View {
    var body: some View {
        Image("App_background")
            .resizable()
            .scaledToFill()
            .frame(minWidth: 0)
            .clipped()
            .ignoresSafeArea()
            .onTapGesture {
                blurInput()
            }
    }
}
