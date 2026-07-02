package controllers

import (
	"strconv"

	"github.com/VYN2/Auth_Service/internal/syncsvc"
	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type ClaimVendorController struct {
	svc     services.ClaimVendorService
	syncSvc syncsvc.SyncService
}

func NewClaimVendorController(svc services.ClaimVendorService) *ClaimVendorController {
	return &ClaimVendorController{svc: svc}
}

// SetSyncService attaches an optional SyncService for async sheet sync.
func (ctrl *ClaimVendorController) SetSyncService(syncSvc syncsvc.SyncService) {
	ctrl.syncSvc = syncSvc
}

func (ctrl *ClaimVendorController) List(c *gin.Context) {
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

func (ctrl *ClaimVendorController) GetByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	m, err := ctrl.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		utils.NotFound(c, "Data tidak ditemukan")
		return
	}
	utils.OK(c, m)
}

func (ctrl *ClaimVendorController) Create(c *gin.Context) {
	var body models.ClaimVendor
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
	if ctrl.syncSvc != nil && ctrl.syncSvc.IsConfigured() {
		go ctrl.syncSvc.SyncAfterCRUD("claim_vendors", syncsvc.OpCreate, &body)
	}
	utils.Created(c, body)
}

func (ctrl *ClaimVendorController) Update(c *gin.Context) {
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
	if ctrl.syncSvc != nil && ctrl.syncSvc.IsConfigured() {
		go ctrl.syncSvc.SyncAfterCRUD("claim_vendors", syncsvc.OpUpdate, existing)
	}
	utils.OK(c, existing)
}

func (ctrl *ClaimVendorController) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	name, userID, ip := utils.ActorFromContext(c)
	if err := ctrl.svc.Delete(c.Request.Context(), uint(id), name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	if ctrl.syncSvc != nil && ctrl.syncSvc.IsConfigured() {
		go ctrl.syncSvc.SyncAfterCRUD("claim_vendors", syncsvc.OpDelete, &models.ClaimVendor{})
	}
	utils.OK(c, gin.H{"message": "Data berhasil dihapus"})
}
