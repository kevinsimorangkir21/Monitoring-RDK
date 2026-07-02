package controllers

import (
	"strconv"

	"github.com/VYN2/Auth_Service/services"
	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

type DashboardController struct{ svc services.DashboardService }

func NewDashboardController(svc services.DashboardService) *DashboardController {
	return &DashboardController{svc: svc}
}

func (ctrl *DashboardController) Stats(c *gin.Context) {
	stats, err := ctrl.svc.Stats(c.Request.Context())
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, stats)
}

func (ctrl *DashboardController) RecentActivity(c *gin.Context) {
	limit := 10
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 {
		limit = l
	}
	logs, err := ctrl.svc.RecentActivity(c.Request.Context(), limit)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, logs)
}
