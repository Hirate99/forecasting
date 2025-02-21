//
//  TForecastRequest.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/25.
//

import Alamofire
import SwiftSpinner

let API_BASE = ""

struct TForecastRequest: Codable {
    let lat: Double
    let lon: Double
    let location: String?
    let city: String?
    let state: String?
}

let forecastCache = NSCache<NSString, StructWrapper<TForecastModel>>()

func fetchForecastBy(city: String, state: String, withCache cache: Bool, completion: @escaping (Result<TForecastModel, AFError>) -> Void) {
    if (cache) {
        if let cached = (forecastCache.object(forKey: "\(city)-\(state)" as NSString)) {
            completion(.success(cached.value))
            return
        }
    }
    
    SwiftSpinner.show("Fetching Weather Details for \(city)...")
    fetchGeocodingByName(place: .init(city: city, state: state)) { (lat, lon) in
        fetchForecast(params: .init(lat: lat, lon: lon, location: "\(city), \(state)", city: city, state: state)) { data in
            SwiftSpinner.hide()
            switch data.result {
            case.success(let data):
                forecastCache.setObject(StructWrapper(data), forKey: "\(city)-\(state)" as NSString)
                completion(.success(data))
            case.failure(let err):
                getRootView()?.makeToast("Failed to retrieve weather details, please try again later")
                completion(.failure(err))
            }
        }
    }
}

func fetchForecast(params: TForecastRequest, completion: @escaping (DataResponse<TForecastModel, AFError>) -> Void) {
    let url = "\(API_BASE)/weather/forecast"
    
    AF.request(url, parameters: params, interceptor: .retryPolicy)
        .validate()
        .responseDecodable(of: TForecastModel.self) { data in
            completion(data)
        }
}
