package controllers

import (
	"context"
	"log"
	"strconv"

	"github.com/VYN2/Auth_Service/internal/syncsvc"
	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type ReportDailyTransportController struct {
	svc              services.ReportDailyTransportService
	appsScriptClient syncsvc.AppsScriptClient
}

func NewReportDailyTransportController(svc services.ReportDailyTransportService) *ReportDailyTransportController {
	return &ReportDailyTransportController{svc: svc}
}

// SetAppsScriptClient injects AppsScriptClient for Google Sheets sync
func (ctrl *ReportDailyTransportController) SetAppsScriptClient(client syncsvc.AppsScriptClient) {
	ctrl.appsScriptClient = client
}

func (ctrl *ReportDailyTransportController) List(c *gin.Context) {
	f := utils.ParseListFilter(map[string]string{
		"search": c.Query("search"), "tanggal_awal": c.Query("tanggal_awal"),
		"tanggal_akhir": c.Query("tanggal_akhir"), "sort": c.Query("sort"),
		"page": c.Query("page"), "limit": c.Query("limit"),
	})
	list, total, err := ctrl.svc.List(c.Request.Context(), f)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OKList(c, list, utils.BuildMeta(f.Page, f.Limit, total))
}

func (ctrl *ReportDailyTransportController) GetByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	m, err := ctrl.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		utils.NotFound(c, "Data tidak ditemukan")
		return
	}
	utils.OK(c, m)
}

func (ctrl *ReportDailyTransportController) Create(c *gin.Context) {
	var body models.ReportDailyTransport
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	name, userID, ip := utils.ActorFromContext(c)
	body.CreatedBy = userID
	if err := ctrl.svc.Create(c.Request.Context(), &body, name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	
	// Async sync to Google Sheets
	if ctrl.appsScriptClient != nil {
		go func() {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[SYNC] panic recovered in CREATE Daily: %v", r)
				}
			}()
			data := syncsvc.EntityToMap(&body)
			if err := ctrl.appsScriptClient.CreateRow(context.Background(), "Daily", data); err != nil {
				log.Printf("[SYNC] failed CREATE Daily: %v", err)
			} else {
				log.Printf("[SYNC] CREATE Daily success (ID=%d)", body.ID)
			}
		}()
	}
	
	utils.Created(c, body)
}

func (ctrl *ReportDailyTransportController) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	existing, err := ctrl.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		utils.NotFound(c, "Data tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(existing); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	existing.ID = uint(id)
	name, userID, ip := utils.ActorFromContext(c)
	if err := ctrl.svc.Update(c.Request.Context(), existing, name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	// Note: UPDATE tidak sync ke Spreadsheet sesuai requirement
	// Spreadsheet adalah arsip operasional, hanya CREATE yang di-sync
	utils.OK(c, existing)
}

func (ctrl *ReportDailyTransportController) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	name, userID, ip := utils.ActorFromContext(c)
	if err := ctrl.svc.Delete(c.Request.Context(), uint(id), name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	// Note: DELETE tidak sync ke Spreadsheet sesuai requirement
	// Spreadsheet adalah arsip operasional
	utils.OK(c, gin.H{"message": "Data berhasil dihapus"})
}
