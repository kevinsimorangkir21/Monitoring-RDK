package controllers

import (
	"context"
	"log"

	"github.com/VYN2/Auth_Service/internal/syncsvc"
	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type OutboundController struct {
	svc              services.OutboundService
	appsScriptClient syncsvc.AppsScriptClient
}

func NewOutboundController(svc services.OutboundService) *OutboundController {
	return &OutboundController{svc: svc}
}

func (ctrl *OutboundController) SetAppsScriptClient(client syncsvc.AppsScriptClient) {
	ctrl.appsScriptClient = client
}

func (ctrl *OutboundController) List(c *gin.Context) {
	f := listFilter(c)
	list, total, err := ctrl.svc.List(c.Request.Context(), f)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OKList(c, list, utils.BuildMeta(f.Page, f.Limit, total))
}

func (ctrl *OutboundController) GetByID(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}
	m, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFound(c, "Data tidak ditemukan")
		return
	}
	utils.OK(c, m)
}

func (ctrl *OutboundController) Create(c *gin.Context) {
	var body models.Outbound
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	name, userID, ip := utils.ActorFromContext(c)
	body.ID = 0 // prevent mass assignment of ID
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
					log.Printf("[SYNC] panic recovered in CREATE OUT: %v", r)
				}
			}()
			data := syncsvc.EntityToMap(&body)
			if err := ctrl.appsScriptClient.CreateRow(context.Background(), "OUT", data); err != nil {
				log.Printf("[SYNC] failed CREATE OUT: %v", err)
			} else {
				log.Printf("[SYNC] CREATE OUT success (ID=%d)", body.ID)
			}
		}()
	}
	
	utils.Created(c, body)
}

func (ctrl *OutboundController) Update(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}
	existing, err := ctrl.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.NotFound(c, "Data tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(existing); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	existing.ID = id
	name, userID, ip := utils.ActorFromContext(c)
	if err := ctrl.svc.Update(c.Request.Context(), existing, name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	// Note: UPDATE tidak sync ke Spreadsheet sesuai requirement
	// Spreadsheet adalah arsip operasional, hanya CREATE yang di-sync
	utils.OK(c, existing)
}

func (ctrl *OutboundController) Delete(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}
	name, userID, ip := utils.ActorFromContext(c)
	if err := ctrl.svc.Delete(c.Request.Context(), id, name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	// Note: DELETE tidak sync ke Spreadsheet sesuai requirement
	// Spreadsheet adalah arsip operasional
	utils.OK(c, gin.H{"message": "Data berhasil dihapus"})
}
