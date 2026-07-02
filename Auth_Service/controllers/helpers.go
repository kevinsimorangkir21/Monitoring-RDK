package controllers

import (
	"strconv"

	"github.com/VYN2/Auth_Service/utils"
	"github.com/gin-gonic/gin"
)

// listFilter extracts standard pagination/filter query params from a request.
func listFilter(c *gin.Context) utils.ListFilter {
	return utils.ParseListFilter(map[string]string{
		"search":        c.Query("search"),
		"tanggal_awal":  c.Query("tanggal_awal"),
		"tanggal_akhir": c.Query("tanggal_akhir"),
		"sort":          c.Query("sort"),
		"page":          c.Query("page"),
		"limit":         c.Query("limit"),
	})
}

// parseID parses the :id route param as uint, writes 400 and returns err on failure.
func parseID(c *gin.Context) (uint, error) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "ID tidak valid")
		return 0, err
	}
	return uint(id), nil
}
