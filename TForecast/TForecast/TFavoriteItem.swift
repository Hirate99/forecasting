//
//  TFavoriteItem.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/26.
//

import Foundation
import SwiftData

@Model
class TFavoriteItem {
    @Attribute(.unique) var id: String
    var city: String
    var state: String
    var timestamp: Date
    
    init(city: String, state: String) {
        self.id =  "\(city)-\(state)"
        self.city = city
        self.state = state
        self.timestamp = Date()
    }
}
