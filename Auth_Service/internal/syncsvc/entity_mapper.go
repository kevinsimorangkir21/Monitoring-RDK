package syncsvc

import (
	"encoding/json"
	"log"
)

// EntityToMap converts any struct to map[string]interface{} for Apps Script
func EntityToMap(entity interface{}) map[string]interface{} {
	data := make(map[string]interface{})
	
	// Use JSON marshal/unmarshal for simple conversion
	jsonBytes, err := json.Marshal(entity)
	if err != nil {
		log.Printf("[SYNC] failed to marshal entity: %v", err)
		return data
	}
	
	if err := json.Unmarshal(jsonBytes, &data); err != nil {
		log.Printf("[SYNC] failed to unmarshal to map: %v", err)
		return data
	}
	
	return data
}
