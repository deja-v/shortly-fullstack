import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./styles.module.scss";
import UrlModal from "./UrlModal";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    InputAdornment,
    Pagination,
    Skeleton,
    Fab
} from "@mui/material";
import {
    Search as SearchIcon,
    ContentCopy as CopyIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    TrendingUp as TrendingUpIcon,
    Link as LinkIcon,
    CalendarToday as CalendarIcon,
    Visibility as VisibilityIcon,
    Email as EmailIcon,
    Add as AddIcon
} from "@mui/icons-material";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [urls, setUrls] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [urlsLoading, setUrlsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingUrl, setEditingUrl] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axiosInstance.get("/user/me");
                if (response.data.success) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                toast.error("Failed to load user profile");
            }
        };

        fetchUserProfile();
    }, []);

    const fetchUserUrls = async (page = 1, search = "", sort = sortBy, order = sortOrder) => {
        setUrlsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                sortBy: sort,
                sortOrder: order,
                search: search
            });

            const response = await axiosInstance.get(`/dashboard/urls?${params}`);
            if (response.data.success) {
                if (response.data.data && response.data.data.urls) {
                    setUrls(response.data.data.urls);

                    const paginationData = response.data.data.pagination;
                    if (paginationData && typeof paginationData.total === 'number') {
                        const calculatedPages = Math.ceil(paginationData.total / 10);
                        setTotalPages(calculatedPages);
                    } else {
                        setTotalPages(1);
                    }
                    setCurrentPage(page);
                } else {
                    setUrls([]);
                    setTotalPages(1);
                }
            }
        } catch (error) {
            console.error("Error fetching URLs:", error);
            toast.error("Failed to load URLs");
            setUrls([]);
            setTotalPages(1);
            setCurrentPage(1);
        } finally {
            setUrlsLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await axiosInstance.get("/dashboard/stats");
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Failed to load statistics");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchUserUrls(1),
                fetchUserStats()
            ]);
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUserUrls(1, searchTerm);
    };

    const handlePageChange = (event, page) => {
        fetchUserUrls(page, searchTerm);
    };

    const handleSort = (field) => {
        const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(field);
        setSortOrder(newOrder);
        fetchUserUrls(1, searchTerm, field, newOrder);
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    };

    const handleDeleteUrl = async (shortId) => {
        if (window.confirm("Are you sure you want to delete this URL?")) {
            try {
                await axiosInstance.delete(`/urls/${shortId}`);
                toast.success("URL deleted successfully");
                fetchUserUrls(currentPage, searchTerm);
                fetchUserStats();
            } catch (error) {
                console.error("Error deleting URL:", error);
                toast.error("Failed to delete URL");
            }
        }
    };

    const handleOpenCreateModal = () => {
        setModalMode("create");
        setEditingUrl(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (url) => {
        setModalMode("edit");
        setEditingUrl(url);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUrl(null);
    };

    const handleModalSuccess = () => {
        fetchUserUrls(currentPage, searchTerm, sortBy, sortOrder);
        fetchUserStats();
    };

    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Skeleton variant="rectangular" height={120} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Skeleton variant="rectangular" height={150} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Skeleton variant="rectangular" height={150} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Skeleton variant="rectangular" height={150} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Skeleton variant="rectangular" height={150} />
                    </Grid>
                    <Grid item xs={12}>
                        <Skeleton variant="rectangular" height={400} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box className={styles.dashboardContainer}>
            <Card className={styles.headerCard}>
                <CardContent className={styles.headerContent}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" className={styles.welcomeText}>
                                Welcome back, {user?.name || "User"}! 👋
                            </Typography>
                            <Typography variant="body1" className={styles.subtitleText}>
                                Manage your shortened URLs and track their performance
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Box className={styles.userInfoContainer}>
                                <Box className={styles.userInfoRow}>
                                    <EmailIcon sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                                    <Typography variant="body2" className={styles.userInfoText}>
                                        {user?.email}
                                    </Typography>
                                </Box>
                                <Box className={styles.userInfoRow}>
                                    <CalendarIcon sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                                    <Typography variant="body2" className={styles.userInfoTextSecondary}>
                                        Last login: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "N/A"}
                                    </Typography>
                                </Box>

                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {stats && (
                <Grid container spacing={3} className={styles.statsGrid}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card className={styles.statCard}>
                            <CardContent className={styles.statCardContent}>
                                <LinkIcon className={styles.statIcon} />
                                <Typography variant="h4" className={styles.statValue}>
                                    {stats.totalUrls}
                                </Typography>
                                <Typography variant="body2" className={styles.statLabel}>
                                    Total URLs
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card className={styles.statCard}>
                            <CardContent className={styles.statCardContent}>
                                <VisibilityIcon className={styles.statIcon} />
                                <Typography variant="h4" className={styles.statValue}>
                                    {stats.totalClicks}
                                </Typography>
                                <Typography variant="body2" className={styles.statLabel}>
                                    Total Clicks
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card className={styles.statCard}>
                            <CardContent className={styles.statCardContent}>
                                <TrendingUpIcon className={styles.statIcon} />
                                <Typography variant="h4" className={styles.statValue}>
                                    {stats.avgClicksPerUrl.toFixed(1)}
                                </Typography>
                                <Typography variant="body2" className={styles.statLabel}>
                                    Avg Clicks/URL
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card className={styles.statCard}>
                            <CardContent className={styles.statCardContent}>
                                <CalendarIcon className={styles.statIcon} />
                                <Typography variant="body1" className={styles.statValue}>
                                    {stats.mostRecentUrl ? new Date(stats.mostRecentUrl).toLocaleDateString() : "No URLs yet"}
                                </Typography>
                                <Typography variant="body2" className={styles.statLabel}>
                                    Recent Activity
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Card className={styles.urlsCard}>
                <CardContent className={styles.urlsCardContent}>
                    <Box className={styles.sectionHeader}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Typography variant="h5" className={styles.sectionTitle}>
                                    Your URLs
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box component="form" onSubmit={handleSearch} className={styles.searchForm}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Search URLs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={styles.searchInput}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: 'var(--text-secondary)' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className={styles.searchButton}
                                    >
                                        Search
                                    </Button>
                                </Box>

                            </Grid>
                        </Grid>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateModal}
                            className={styles.createUrlButton}
                            size="medium"
                        >
                            Create New URL
                        </Button>
                    </Box>

                    <Box className={styles.tableContainer}>
                        {urlsLoading ? (
                            <Box className={styles.loadingContainer}>
                                <Skeleton variant="rectangular" height={200} />
                            </Box>
                        ) : urls.length === 0 ? (
                            <Box className={styles.emptyState}>
                                <LinkIcon className={styles.emptyStateIcon} />
                                <Typography variant="h6" className={styles.emptyStateTitle}>
                                    No URLs found
                                </Typography>
                                <Typography variant="body2" className={styles.emptyStateText}>
                                    Create your first shortened URL to get started!
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow className={styles.tableHeader}>
                                            <TableCell
                                                className={styles.tableHeaderCell}
                                                onClick={() => handleSort("shortId")}
                                            >
                                                Short URL
                                                {sortBy === "shortId" && (
                                                    <Chip
                                                        label={sortOrder === "asc" ? "↑" : "↓"}
                                                        size="small"
                                                        className={styles.sortChip}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={styles.tableHeaderCell}
                                                onClick={() => handleSort("redirectUrl")}
                                            >
                                                Original URL
                                                {sortBy === "redirectUrl" && (
                                                    <Chip
                                                        label={sortOrder === "asc" ? "↑" : "↓"}
                                                        size="small"
                                                        className={styles.sortChip}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={styles.tableHeaderCell}
                                                onClick={() => handleSort("clickCount")}
                                            >
                                                Clicks
                                                {sortBy === "clickCount" && (
                                                    <Chip
                                                        label={sortOrder === "asc" ? "↑" : "↓"}
                                                        size="small"
                                                        className={styles.sortChip}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={styles.tableHeaderCell}
                                                onClick={() => handleSort("createdAt")}
                                            >
                                                Created
                                                {sortBy === "createdAt" && (
                                                    <Chip
                                                        label={sortOrder === "asc" ? "↑" : "↓"}
                                                        size="small"
                                                        className={styles.sortChip}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className={styles.tableHeaderCell}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {urls.map((url) => (
                                            <TableRow
                                                key={url.id}
                                                className={styles.tableRow}
                                            >
                                                <TableCell className={styles.tableCell}>
                                                    <Box className={styles.shortUrlCell}>
                                                        <LinkIcon className={styles.shortUrlIcon} />
                                                        <Box>
                                                            <Typography variant="body2" className={styles.shortUrlText}>
                                                                {url.shortUrl}
                                                            </Typography>
                                                            {url.customAlias && (
                                                                <Chip
                                                                    label={`/${url.customAlias}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ mt: 0.5 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell className={styles.tableCell}>
                                                    <Typography
                                                        variant="body2"
                                                        className={styles.originalUrlText}
                                                        title={url.redirectUrl}
                                                    >
                                                        {url.redirectUrl}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className={styles.tableCell}>
                                                    <Chip
                                                        label={url.clickCount}
                                                        size="small"
                                                        className={styles.clickCountChip}
                                                    />
                                                </TableCell>
                                                <TableCell className={styles.tableCell}>
                                                    <Typography variant="body2" className={styles.createdDateText}>
                                                        {new Date(url.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell className={styles.tableCell}>
                                                    <Box className={styles.actionsCell}>
                                                        <IconButton
                                                            onClick={() => copyToClipboard(url.shortUrl)}
                                                            size="small"
                                                            className={styles.copyButton}
                                                            title="Copy URL"
                                                        >
                                                            <CopyIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleOpenEditModal(url)}
                                                            size="small"
                                                            className={styles.editButton}
                                                            title="Edit URL"
                                                        >
                                                            <EditIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDeleteUrl(url.shortId)}
                                                            size="small"
                                                            className={styles.deleteButton}
                                                            title="Delete URL"
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>

                    {urls.length > 0 && (
                        <Box className={styles.paginationContainer}>
                            {/* <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Page {currentPage} of {Math.max(1, totalPages)} • {urls.length} URLs shown
                            </Typography> */}
                            {totalPages > 0 ? (
                                <Pagination
                                    count={Math.max(1, totalPages)}
                                    page={Math.min(currentPage, Math.max(1, totalPages))}
                                    onChange={handlePageChange}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                    disabled={totalPages <= 1}
                                    size="large"
                                />
                            ) : (
                                <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Loading pagination...
                                </Typography>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <UrlModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleModalSuccess}
                editData={editingUrl}
                mode={modalMode}
            />

            <Fab
                color="primary"
                aria-label="Create new URL"
                onClick={handleOpenCreateModal}
                className={styles.fab}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    display: { xs: 'flex', md: 'none' }
                }}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
};

export default Dashboard;
