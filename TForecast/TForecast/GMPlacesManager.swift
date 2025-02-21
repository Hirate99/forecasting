//
//  GMPlacesManager.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/25.
//

import Alamofire
import SwiftyJSON

let GMS_KEY = ""

struct GMPlace {
    let city: String
    let state: String
}

extension GMPlace {
    var id: String {
        return "\(self.city)-\(self.state)"
    }
}

func placeAutocomplete(for query: String, completion: @escaping ([GMPlace]) -> Void) {
    let baseURL = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    
    let params = [
        "input": query,
        "key": GMS_KEY,
        "types": "(cities)",
        "language": "en"
    ]
    
    AF.request(baseURL, parameters: params).response { response in
        switch (response.result) {
        case .success(let _data):
            do {
                if let data = _data {
                    let json = try? JSON(data: data)
                    let terms = json?["predictions"].arrayValue.map { $0["terms"].arrayValue
                    }.map({  term in
                        let city = term[0]["value"].stringValue
                        let state = term[1]["value"].stringValue
                        return GMPlace(city: city, state: state)
                    })
                    
                    if let places = terms {
                        completion(places)
                    }
                }
            }
        case .failure(let e):
            print(e)
        }
    }
}

func fetchGeocodingByName(place: GMPlace, completion: @escaping ((Double, Double)) -> Void) {
    let baseURL = "https://maps.googleapis.com/maps/api/geocode/json"
    
    let address = "+\(place.city),+\(place.state)"
    let params = [
        "address": address,
        "key": GMS_KEY,
    ]
    
    AF.request(baseURL, parameters: params).response { response in
        switch (response.result) {
        case .success(let _data):
            do {
                if let data = _data {
                    let json = try? JSON(data: data)
                    let location = json?["results"].arrayValue.first?["geometry"]["location"]
                    let lat = location?["lat"].doubleValue
                    let lon = location?["lng"].doubleValue
                    completion((lat ?? 0, lon ?? 0))
                }
            }
        case .failure(let e):
            print(e)
            completion((0, 0))
        }
    }
}
