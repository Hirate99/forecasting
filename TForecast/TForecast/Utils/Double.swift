//
//  Double.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/26.
//

import Foundation

extension Double {
    public func formatted(places: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = places
        formatter.minimumFractionDigits = places
        
        if let formatted = formatter.string(from: NSNumber(value: self)) {
            return formatted
        }
        
        return ""
    }
}
