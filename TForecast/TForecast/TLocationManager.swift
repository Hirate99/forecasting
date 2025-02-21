//
//  TLocationManager.swift
//  TForecast
//
//  Created by 苏浩南 on 2024/11/25.
//

import CoreLocation

class TLocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    static let shared = TLocationManager()
    
    @Published var location: CLLocation?
    
    private let manager = CLLocationManager()
    
    override init() {
        super.init()
        manager.delegate = self
        manager.requestWhenInUseAuthorization()
    }
    
    func makeErrorToast() {
        getRootView()?.makeToast("Failed to retrieve current location", duration: 2)
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: any Error) {
        print(error)
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        if (manager.authorizationStatus == .authorizedAlways || manager.authorizationStatus == .authorizedWhenInUse) {
            manager.requestLocation()
        } else {
            makeErrorToast()
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.first else {
            return
        }
        self.location = location
    }
    
    func requestLocation() {
        manager.requestLocation()
    }
}
