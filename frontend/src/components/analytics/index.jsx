import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./styles.module.scss";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Skeleton,
    IconButton,
    Tooltip
} from "@mui/material";
import {
    TrendingUp as TrendingUpIcon,
    Link as LinkIcon,
    CalendarToday as CalendarIcon,
    Visibility as VisibilityIcon,
    BarChart as BarChartIcon,
    Refresh as RefreshIcon,
    OpenInNew as OpenInNewIcon,
    ContentCopy as CopyIcon,
    Add as AddIcon
} from "@mui/icons-material";

const Analytics = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [topUrls, setTopUrls] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    const fetchAnalyticsData = async () => {
        try {
            const [statsResponse, urlsResponse] = await Promise.all([
                axiosInstance.get("/dashboard/stats"),
                axiosInstance.get("/dashboard/urls?limit=5&sortBy=clickCount&sortOrder=desc")
            ]);

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

            if (urlsResponse.data.success) {
                setTopUrls(urlsResponse.data.data.urls);
                const activity = urlsResponse.data.data.urls
                    .filter(url => url.lastAccessedAt)
                    .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
                    .slice(0, 5);
                setRecentActivity(activity);
            }
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            toast.error("Failed to load analytics data");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchAnalyticsData();
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAnalyticsData();
        setRefreshing(false);
        toast.success("Analytics data refreshed!");
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    };

    const viewUrlAnalytics = (shortId) => {
        navigate(`/analytics/url/${shortId}`);
    };

    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Skeleton variant="rectangular" height={120} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" height={150} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" height={150} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" height={150} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={300} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={300} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box className={styles.analyticsContainer}>
            <Grid container spacing={3}>
                <Grid sx={{ width: '100%' }} item xs={12}>
                    <Card className={styles.headerCard}>
                        <CardContent className={styles.headerContent}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h4" className={styles.welcomeText}>
                                        Analytics Dashboard 📊
                                    </Typography>
                                    <Typography variant="body1" className={styles.subtitleText}>
                                        Track your URL performance and user engagement
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        className={styles.refreshButton}
                                    >
                                        {refreshing ? "Refreshing..." : "Refresh Data"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {stats && (
                    <Grid sx={{ width: '100%' }} container spacing={3} className={styles.statsGrid}>
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

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Card className={styles.analyticsCard}>
                            <CardContent className={styles.cardContent}>
                                <Box className={styles.cardHeader}>
                                    <Typography variant="h6" className={styles.cardTitle}>
                                        <BarChartIcon className={styles.cardIcon} />
                                        Top Performing URLs
                                    </Typography>
                                </Box>

                                {topUrls.length === 0 ? (
                                    <Box className={styles.emptyState}>
                                        <LinkIcon className={styles.emptyStateIcon} />
                                        <Typography variant="h6" className={styles.emptyStateTitle}>
                                            No URLs yet
                                        </Typography>
                                        <Typography variant="body2" className={styles.emptyStateText}>
                                            Create your first URL to see analytics!
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate("/dashboard")}
                                            className={styles.createButton}
                                        >
                                            Go to Dashboard
                                        </Button>
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow className={styles.tableHeader}>
                                                    <TableCell className={styles.tableHeaderCell}>URL</TableCell>
                                                    <TableCell className={styles.tableHeaderCell}>Clicks</TableCell>
                                                    <TableCell className={styles.tableHeaderCell}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {topUrls.map((url) => (
                                                    <TableRow key={url.id} className={styles.tableRow}>
                                                        <TableCell className={styles.tableCell}>
                                                            <Box className={styles.urlCell}>
                                                                <Typography
                                                                    variant="body2"
                                                                    className={styles.urlText}
                                                                    title={url.redirectUrl}
                                                                >
                                                                    {url.redirectUrl.length > 40 
                                                                        ? `${url.redirectUrl.substring(0, 40)}...`
                                                                        : url.redirectUrl
                                                                    }
                                                                </Typography>
                                                                <Typography variant="caption" className={styles.shortUrlText}>
                                                                    {url.shortUrl}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell className={styles.tableCell}>
                                                            <Chip
                                                                label={url.clickCount}
                                                                size="small"
                                                                className={styles.clickCountChip}
                                                            />
                                                        </TableCell>
                                                        <TableCell className={styles.tableCell}>
                                                            <Box className={styles.actionsCell}>
                                                                <Tooltip title="View Analytics">
                                                                    <IconButton
                                                                        onClick={() => viewUrlAnalytics(url.shortId)}
                                                                        size="small"
                                                                        className={styles.analyticsButton}
                                                                    >
                                                                        <BarChartIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Copy URL">
                                                                    <IconButton
                                                                        onClick={() => copyToClipboard(url.shortUrl)}
                                                                        size="small"
                                                                        className={styles.copyButton}
                                                                    >
                                                                        <CopyIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Activity */}
                    <Grid item xs={12} lg={4}>
                        <Card className={styles.analyticsCard}>
                            <CardContent className={styles.cardContent}>
                                <Box className={styles.cardHeader}>
                                    <Typography variant="h6" className={styles.cardTitle}>
                                        <CalendarIcon className={styles.cardIcon} />
                                        Recent Activity
                                    </Typography>
                                </Box>

                                {recentActivity.length === 0 ? (
                                    <Box className={styles.emptyState}>
                                        <CalendarIcon className={styles.emptyStateIcon} />
                                        <Typography variant="h6" className={styles.emptyStateTitle}>
                                            No recent activity
                                        </Typography>
                                        <Typography variant="body2" className={styles.emptyStateText}>
                                            Your URLs will appear here once they get clicks!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box className={styles.activityList}>
                                        {recentActivity.map((url, index) => (
                                            <Box key={url.id} className={styles.activityItem}>
                                                <Box className={styles.activityContent}>
                                                    <Typography variant="body2" className={styles.activityUrl}>
                                                        {url.redirectUrl.length > 50 
                                                            ? `${url.redirectUrl.substring(0, 50)}...`
                                                            : url.redirectUrl
                                                        }
                                                    </Typography>
                                                    <Typography variant="caption" className={styles.activityTime}>
                                                        Last clicked: {new Date(url.lastAccessedAt).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box className={styles.activityActions}>
                                                    <Chip
                                                        label={`${url.clickCount} clicks`}
                                                        size="small"
                                                        className={styles.activityChip}
                                                    />
                                                    <IconButton
                                                        onClick={() => viewUrlAnalytics(url.shortId)}
                                                        size="small"
                                                        className={styles.activityButton}
                                                    >
                                                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12}>
                    <Card className={styles.quickActionsCard}>
                        <CardContent className={styles.cardContent}>
                            <Typography variant="h6" className={styles.cardTitle}>
                                Quick Actions
                            </Typography>
                            <Box className={styles.quickActions}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate("/dashboard")}
                                    className={styles.actionButton}
                                >
                                    Create New URL
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<LinkIcon />}
                                    onClick={() => navigate("/dashboard")}
                                    className={styles.actionButton}
                                >
                                    Manage URLs
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics;