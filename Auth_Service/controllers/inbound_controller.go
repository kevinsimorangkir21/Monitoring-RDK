package controllers

import (
	"context"
	"log"
	"strconv"

	"github.com/VYN2/Auth_Service/dto"
	"github.com/VYN2/Auth_Service/internal/syncsvc"
	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type InboundController struct {
	svc              services.InboundService
	appsScriptClient syncsvc.AppsScriptClient
}

func NewInboundController(svc services.InboundService) *InboundController {
	return &InboundController{svc: svc}
}

// SetAppsScriptClient injects AppsScriptClient for Google Sheets sync
func (ctrl *InboundController) SetAppsScriptClient(client syncsvc.AppsScriptClient) {
	ctrl.appsScriptClient = client
}

func (ctrl *InboundController) List(c *gin.Context) {
	f := utils.ParseListFilter(map[string]string{
		"search":        c.Query("search"),
		"tanggal_awal":  c.Query("tanggal_awal"),
		"tanggal_akhir": c.Query("tanggal_akhir"),
		"sort":          c.Query("sort"),
		"page":          c.Query("page"),
		"limit":         c.Query("limit"),
	})
	list, total, err := ctrl.svc.List(c.Request.Context(), f)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OKList(c, list, utils.BuildMeta(f.Page, f.Limit, total))
}

func (ctrl *InboundController) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}
	m, err := ctrl.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		utils.NotFound(c, "Data tidak ditemukan")
		return
	}
	utils.OK(c, m)
}

func (ctrl *InboundController) Create(c *gin.Context) {
	// Bind to DTO — prevents mass assignment of id/created_at/etc.
	var req dto.CreateInboundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	_, userID, ip := utils.ActorFromContext(c)
	name, _, _ := utils.ActorFromContext(c)

	// Map validated DTO → model
	m := &models.Inbound{
		Shifting:       req.Shifting,
		NomorFO:        req.NomorFO,
		Nopol:          req.Nopol,
		PlantPabrik:    req.PlantPabrik,
		JenisBongkaran: models.JenisBongkaran(req.JenisBongkaran),
		TotalBox:       req.TotalBox,
		NomorGR:        req.NomorGR,
		TotalSlipsheet: req.TotalSlipsheet,
		CreatedBy:      userID,
	}
	if err := ctrl.svc.Create(c.Request.Context(), m, name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	
	// Async sync to Google Sheets
	if ctrl.appsScriptClient != nil {
		go func() {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[SYNC] panic recovered in CREATE IN: %v", r)
				}
			}()
			data := syncsvc.EntityToMap(m)
			if err := ctrl.appsScriptClient.CreateRow(context.Background(), "IN", data); err != nil {
				log.Printf("[SYNC] failed CREATE IN: %v", err)
			} else {
				log.Printf("[SYNC] CREATE IN success (ID=%d)", m.ID)
			}
		}()
	}
	
	utils.Created(c, m)
}

func (ctrl *InboundController) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}
	existing, err := ctrl.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		utils.NotFound(c, "Data tidak ditemukan")
		return
	}

	var req dto.UpdateInboundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	// Apply only non-zero fields to prevent overwrite with zero values
	if req.Shifting != "" {
		existing.Shifting = req.Shifting
	}
	if req.NomorFO != "" {
		existing.NomorFO = req.NomorFO
	}
	if req.Nopol != "" {
		existing.Nopol = req.Nopol
	}
	if req.PlantPabrik != "" {
		existing.PlantPabrik = req.PlantPabrik
	}
	if req.JenisBongkaran != "" {
		existing.JenisBongkaran = models.JenisBongkaran(req.JenisBongkaran)
	}
	if req.TotalBox != nil {
		existing.TotalBox = *req.TotalBox
	}
	if req.NomorGR != "" {
		existing.NomorGR = req.NomorGR
	}
	if req.TotalSlipsheet != nil {
		existing.TotalSlipsheet = *req.TotalSlipsheet
	}

	name, userID, ip := utils.ActorFromContext(c)
	if err := ctrl.svc.Update(c.Request.Context(), existing, name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	// Note: UPDATE tidak sync ke Spreadsheet sesuai requirement
	// Spreadsheet adalah arsip operasional, hanya CREATE yang di-sync
	utils.OK(c, existing)
}

func (ctrl *InboundController) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return
	}
	name, userID, ip := utils.ActorFromContext(c)
	if err := ctrl.svc.Delete(c.Request.Context(), uint(id), name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	// Note: DELETE tidak sync ke Spreadsheet sesuai requirement
	// Spreadsheet adalah arsip operasional
	utils.OK(c, gin.H{"message": "Data berhasil dihapus"})
}
