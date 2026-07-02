package syncsvc

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// AppsScriptClient mengirim request ke Google Apps Script untuk update Spreadsheet
type AppsScriptClient interface {
	CreateRow(ctx context.Context, sheet string, data map[string]interface{}) error
	UpdateRow(ctx context.Context, sheet string, id string, data map[string]interface{}) error
	DeleteRow(ctx context.Context, sheet string, id string) error
}

type appsScriptClientImpl struct {
	scriptURL string
	client    *http.Client
}

// NewAppsScriptClient membuat instance AppsScriptClient baru
func NewAppsScriptClient(scriptURL string) AppsScriptClient {
	if scriptURL == "" {
		log.Println("[SYNC] Apps Script URL not configured - sync disabled")
		return &noopClient{}
	}
	
	log.Println("[SYNC] Apps Script client initialized")
	return &appsScriptClientImpl{
		scriptURL: scriptURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// CreateRow mengirim request CREATE ke Apps Script
func (c *appsScriptClientImpl) CreateRow(ctx context.Context, sheet string, data map[string]interface{}) error {
	payload := map[string]interface{}{
		"action": "create",
		"sheet":  sheet,
		"data":   data,
	}
	
	log.Printf("[SYNC TO GOOGLE SHEET] CREATE sheet=%s", sheet)
	return c.sendRequest(ctx, payload)
}

// UpdateRow mengirim request UPDATE ke Apps Script
func (c *appsScriptClientImpl) UpdateRow(ctx context.Context, sheet string, id string, data map[string]interface{}) error {
	payload := map[string]interface{}{
		"action": "update",
		"sheet":  sheet,
		"rowId":  id,
		"data":   data,
	}
	
	log.Printf("[SYNC TO GOOGLE SHEET] UPDATE sheet=%s id=%s", sheet, id)
	return c.sendRequest(ctx, payload)
}

// DeleteRow mengirim request DELETE ke Apps Script
func (c *appsScriptClientImpl) DeleteRow(ctx context.Context, sheet string, id string) error {
	payload := map[string]interface{}{
		"action": "delete",
		"sheet":  sheet,
		"rowId":  id,
	}
	
	log.Printf("[SYNC TO GOOGLE SHEET] DELETE sheet=%s id=%s", sheet, id)
	return c.sendRequest(ctx, payload)
}

// sendRequest mengirim HTTP POST request ke Apps Script
func (c *appsScriptClientImpl) sendRequest(ctx context.Context, payload map[string]interface{}) error {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}
	
	req, err := http.NewRequestWithContext(ctx, "POST", c.scriptURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	
	if resp.StatusCode != 200 {
		return fmt.Errorf("Apps Script returned HTTP %d: %s", resp.StatusCode, string(body))
	}
	
	// Parse response
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		// Non-critical error - Apps Script mungkin tidak return JSON
		log.Printf("[SYNC TO GOOGLE SHEET] Warning: failed to parse response: %v", err)
		return nil
	}
	
	// Check for error in response
	if errMsg, ok := result["error"]; ok {
		return fmt.Errorf("Apps Script error: %v", errMsg)
	}
	
	log.Printf("[SYNC TO GOOGLE SHEET] Success")
	return nil
}

// noopClient adalah implementasi no-op untuk kasus scriptURL kosong
type noopClient struct{}

func (c *noopClient) CreateRow(ctx context.Context, sheet string, data map[string]interface{}) error {
	return nil
}

func (c *noopClient) UpdateRow(ctx context.Context, sheet string, id string, data map[string]interface{}) error {
	return nil
}

func (c *noopClient) DeleteRow(ctx context.Context, sheet string, id string) error {
	return nil
}
