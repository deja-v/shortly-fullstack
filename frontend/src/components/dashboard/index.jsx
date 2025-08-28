import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./styles.module.scss";
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
    Skeleton
} from "@mui/material";
import {
    Search as SearchIcon,
    ContentCopy as CopyIcon,
    Delete as DeleteIcon,
    TrendingUp as TrendingUpIcon,
    Link as LinkIcon,
    CalendarToday as CalendarIcon,
    Visibility as VisibilityIcon,
    Email as EmailIcon
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

    // Fetch user profile
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

    // Fetch user URLs
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
                setUrls(response.data.data.urls);
                setTotalPages(Math.ceil(response.data.data.total / 10));
                setCurrentPage(page);
            }
        } catch (error) {
            console.error("Error fetching URLs:", error);
            toast.error("Failed to load URLs");
        } finally {
            setUrlsLoading(false);
        }
    };

    // Fetch user stats
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

    // Initial data fetch
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

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        fetchUserUrls(1, searchTerm);
    };

    // Handle pagination
    const handlePageChange = (event, page) => {
        fetchUserUrls(page, searchTerm);
    };

    // Handle sorting
    const handleSort = (field) => {
        const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(field);
        setSortOrder(newOrder);
        fetchUserUrls(1, searchTerm, field, newOrder);
    };

    // Copy URL to clipboard
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    };

    // Delete URL
    const handleDeleteUrl = async (urlId) => {
        if (window.confirm("Are you sure you want to delete this URL?")) {
            try {
                await axiosInstance.delete(`/urls/${urlId}`);
                toast.success("URL deleted successfully");
                fetchUserUrls(currentPage, searchTerm);
                fetchUserStats();
            } catch (error) {
                console.error("Error deleting URL:", error);
                toast.error("Failed to delete URL");
            }
        }
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
            {/* Header */}
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

            {/* Stats Cards */}
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

            {/* URLs Section */}
            <Card className={styles.urlsCard}>
                <CardContent className={styles.urlsCardContent}>
                    {/* Section Header */}
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
                    </Box>

                    {/* URLs Table */}
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
                                                        >
                                                            <CopyIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDeleteUrl(url.id)}
                                                            size="small"
                                                            className={styles.deleteButton}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box className={styles.paginationContainer}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Dashboard;
