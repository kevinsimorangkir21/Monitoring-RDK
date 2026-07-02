package controllers

import (
	"github.com/VYN2/Auth_Service/internal/syncsvc"
	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type OutboundController struct {
	svc     services.OutboundService
	syncSvc syncsvc.SyncService
}

func NewOutboundController(svc services.OutboundService) *OutboundController {
	return &OutboundController{svc: svc}
}

func (ctrl *OutboundController) SetSyncService(syncSvc syncsvc.SyncService) {
	ctrl.syncSvc = syncSvc
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
	if ctrl.syncSvc != nil && ctrl.syncSvc.IsConfigured() {
		go ctrl.syncSvc.SyncAfterCRUD("outbounds", syncsvc.OpCreate, &body)
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
	if ctrl.syncSvc != nil && ctrl.syncSvc.IsConfigured() {
		go ctrl.syncSvc.SyncAfterCRUD("outbounds", syncsvc.OpUpdate, existing)
	}
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
	if ctrl.syncSvc != nil && ctrl.syncSvc.IsConfigured() {
		go ctrl.syncSvc.SyncAfterCRUD("outbounds", syncsvc.OpDelete, &models.Outbound{})
	}
	utils.OK(c, gin.H{"message": "Data berhasil dihapus"})
}
