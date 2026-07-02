package controllers

import (
	"strconv"

	"github.com/VYN2/Auth_Service/internal/syncsvc"
	"github.com/VYN2/Auth_Service/models"
	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type SetoranController struct {
	svc     services.SetoranService
	syncSvc syncsvc.SyncService
}

func NewSetoranController(svc services.SetoranService) *SetoranController {
	return &SetoranController{svc: svc}
}

// SetSyncService attaches an optional SyncService for async sheet sync.
func (ctrl *SetoranController) SetSyncService(syncSvc syncsvc.SyncService) {
	ctrl.syncSvc = syncSvc
}

func (ctrl *SetoranController) List(c *gin.Context) {
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

func (ctrl *SetoranController) GetByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	m, err := ctrl.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		utils.NotFound(c, "Data tidak ditemukan")
		return
	}
	utils.OK(c, m)
}

func (ctrl *SetoranController) AvgDurasi(c *gin.Context) {
	avg, err := ctrl.svc.AvgDurasi(c.Request.Context())
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, gin.H{"avg_durasi": avg})
}

func (ctrl *SetoranController) Create(c *gin.Context) {
	var body models.Setoran
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
		go ctrl.syncSvc.SyncAfterCRUD("setorans", syncsvc.OpCreate, &body)
	}
	utils.Created(c, body)
}

func (ctrl *SetoranController) Update(c *gin.Context) {
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
		go ctrl.syncSvc.SyncAfterCRUD("setorans", syncsvc.OpUpdate, existing)
	}
	utils.OK(c, existing)
}

func (ctrl *SetoranController) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	name, userID, ip := utils.ActorFromContext(c)
	if err := ctrl.svc.Delete(c.Request.Context(), uint(id), name, userID, ip); err != nil {
		utils.InternalError(c, err)
		return
	}
	if ctrl.syncSvc != nil && ctrl.syncSvc.IsConfigured() {
		go ctrl.syncSvc.SyncAfterCRUD("setorans", syncsvc.OpDelete, &models.Setoran{})
	}
	utils.OK(c, gin.H{"message": "Data berhasil dihapus"})
}
