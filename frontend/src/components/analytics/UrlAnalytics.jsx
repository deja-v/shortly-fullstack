import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./UrlAnalytics.module.scss";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Chip,
    Skeleton,
    IconButton,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Link as LinkIcon,
    Visibility as VisibilityIcon,
    CalendarToday as CalendarIcon,
    TrendingUp as TrendingUpIcon,
    AccessTime as AccessTimeIcon,
    ContentCopy as CopyIcon,
    OpenInNew as OpenInNewIcon,
    BarChart as BarChartIcon,
    Refresh as RefreshIcon
} from "@mui/icons-material";

const UrlAnalytics = () => {
    const { shortId } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch URL analytics data
    const fetchUrlAnalytics = async () => {
        try {
            const response = await axiosInstance.get(`/analytics/${shortId}`);
            if (response.data.success) {
                setAnalytics(response.data.data);
            } else {
                toast.error("Failed to load analytics data");
            }
        } catch (error) {
            console.error("Error fetching URL analytics:", error);
            if (error.response?.status === 404) {
                toast.error("URL not found or access denied");
            } else {
                toast.error("Failed to load analytics data");
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchUrlAnalytics();
            setLoading(false);
        };

        fetchData();
    }, [shortId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUrlAnalytics();
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Skeleton variant="rectangular" height={120} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={300} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={300} />
                    </Grid>
                    <Grid item xs={12}>
                        <Skeleton variant="rectangular" height={400} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (!analytics) {
        return (
            <Box className={styles.errorContainer}>
                <Typography variant="h5" className={styles.errorTitle}>
                    Analytics Not Available
                </Typography>
                <Typography variant="body1" className={styles.errorText}>
                    Unable to load analytics for this URL. It may not exist or you don't have permission to view it.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/analytics")}
                    className={styles.backButton}
                >
                    Back to Analytics
                </Button>
            </Box>
        );
    }

    return (
        <Box className={styles.urlAnalyticsContainer}>
            <Grid container spacing={3}>
                {/* Header */}
                <Grid sx={{ width: '100%' }} item xs={12}>
                    <Card className={styles.headerCard}>
                        <CardContent className={styles.headerContent}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <Box className={styles.headerLeft}>
                                        <Typography variant="h4" className={styles.pageTitle}>
                                            URL Analytics
                                        </Typography>
                                        <Typography variant="body1" className={styles.urlText}>
                                            {analytics.redirectUrl}
                                        </Typography>
                                        <Typography variant="caption" className={styles.shortUrlText}>
                                            Short URL: {window.location.origin}/{analytics.shortId}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                    <Box className={styles.headerActions}>
                                        <Button
                                            startIcon={<ArrowBackIcon />}
                                            onClick={() => navigate("/analytics")}
                                            className={styles.backButton}
                                        >
                                            Back to Analytics
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<RefreshIcon />}
                                            onClick={handleRefresh}
                                            disabled={refreshing}
                                            className={styles.refreshButton}
                                        >
                                            {refreshing ? "Refreshing..." : "Refresh Data"}
                                        </Button>
                                        <Tooltip title="Copy Short URL">
                                            <IconButton
                                                onClick={() => copyToClipboard(`${window.location.origin}/${analytics.shortId}`)}
                                                className={styles.copyButton}
                                            >
                                                <CopyIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stats Overview */}
                <Grid container spacing={3}>
                    <Grid item xs={3}>
                        <Card className={styles.statCard}>
                            <CardContent className={styles.statCardContent}>
                                <CalendarIcon className={styles.statIcon} />
                                <Typography variant="body1" className={styles.statValue}>
                                    {formatDate(analytics.createdAt)}
                                </Typography>
                                <Typography variant="body2" className={styles.statLabel}>
                                    Created
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={3}>
                        <Card className={styles.statCard}>
                            <CardContent className={styles.statCardContent}>
                                <AccessTimeIcon className={styles.statIcon} />
                                <Typography variant="body1" className={styles.statValue}>
                                    {analytics.lastAccessedAt ? formatDate(analytics.lastAccessedAt) : "Never"}
                                </Typography>
                                <Typography variant="body2" className={styles.statLabel}>
                                    Last Clicked
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={3}>
                        <Card className={styles.statCard}>
                            <CardContent className={styles.statCardContent}>
                                <TrendingUpIcon className={styles.statIcon} />
                                <Typography variant="body1" className={styles.statValue}>
                                    {analytics.isExpired ? "Expired" : "Active"}
                                </Typography>
                                <Typography variant="body2" className={styles.statLabel}>
                                    Status
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={3}>
                        <Card className={styles.statCard}>
                            <CardContent className={styles.statCardContent}>
                                <VisibilityIcon className={styles.statIcon} />
                                <Typography variant="h4" className={styles.statValue}>
                                    {analytics.totalClicks}
                                </Typography>
                                <Typography variant="body2" className={styles.statLabel}>
                                    Total Clicks
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Main Content Row */}
                <Grid container spacing={3}>
                    {/* Click History */}
                    <Grid item xs={12} lg={8}>
                        <Card className={styles.analyticsCard}>
                            <CardContent className={styles.cardContent}>
                                <Box className={styles.cardHeader}>
                                    <Typography variant="h6" className={styles.cardTitle}>
                                        <BarChartIcon className={styles.cardIcon} />
                                        Click History
                                    </Typography>
                                </Box>

                                {analytics.visitHistory.length === 0 ? (
                                    <Box className={styles.emptyState}>
                                        <VisibilityIcon className={styles.emptyStateIcon} />
                                        <Typography variant="h6" className={styles.emptyStateTitle}>
                                            No clicks yet
                                        </Typography>
                                        <Typography variant="body2" className={styles.emptyStateText}>
                                            This URL hasn't been clicked yet. Share it to start tracking clicks!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box className={styles.clickHistory}>
                                        <List>
                                            {analytics.visitHistory.slice(0, 10).map((visit, index) => (
                                                <ListItem key={index} className={styles.clickItem}>
                                                    <ListItemIcon>
                                                        <VisibilityIcon className={styles.clickIcon} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={`Click #${analytics.visitHistory.length - index}`}
                                                        secondary={formatDate(visit.timestamp)}
                                                    />
                                                    <Chip
                                                        label={getTimeAgo(visit.timestamp)}
                                                        size="small"
                                                        className={styles.timeChip}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                        {analytics.visitHistory.length > 10 && (
                                            <Typography variant="caption" className={styles.moreText}>
                                                Showing latest 10 clicks of {analytics.visitHistory.length} total
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column - Daily Clicks and URL Details */}
                    <Grid item xs={12} lg={4}>
                        <Grid container spacing={3} direction="column">
                            {/* Daily Clicks Chart */}
                            <Grid item xs={12}>
                                <Card className={styles.analyticsCard}>
                                    <CardContent className={styles.cardContent}>
                                        <Box className={styles.cardHeader}>
                                            <Typography variant="h6" className={styles.cardTitle}>
                                                <TrendingUpIcon className={styles.cardIcon} />
                                                Daily Clicks
                                            </Typography>
                                        </Box>

                                        {analytics.dailyClicks.length === 0 ? (
                                            <Box className={styles.emptyState}>
                                                <BarChartIcon className={styles.emptyStateIcon} />
                                                <Typography variant="body2" className={styles.emptyStateText}>
                                                    No daily data available
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box className={styles.dailyClicks}>
                                                {analytics.dailyClicks.slice(-7).map((day, index) => (
                                                    <Box key={index} className={styles.dailyClickItem}>
                                                        <Typography variant="body2" className={styles.dateText}>
                                                            {new Date(day.date).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}
                                                        </Typography>
                                                        <Box className={styles.clickBar}>
                                                            <Box 
                                                                className={styles.clickBarFill}
                                                                style={{ 
                                                                    width: `${Math.max(10, (day.clicks / Math.max(...analytics.dailyClicks.map(d => d.clicks))) * 100)}%` 
                                                                }}
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" className={styles.clickCount}>
                                                            {day.clicks}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* URL Details - Compact Layout */}
                            <Grid item xs={12}>
                                <Card className={styles.urlDetailsCard}>
                                    <CardContent className={styles.urlDetailsContent}>
                                        <Typography variant="h6" className={styles.urlDetailsTitle}>
                                            URL Details
                                        </Typography>
                                        <Box className={styles.urlDetailsGrid}>
                                            <Box className={styles.urlDetailItem}>
                                                <Typography variant="body2" className={styles.urlDetailLabel}>
                                                    SHORT ID
                                                </Typography>
                                                <Typography variant="body1" className={styles.urlDetailValue}>
                                                    {analytics.shortId}
                                                </Typography>
                                            </Box>
                                            <Box className={styles.urlDetailItem}>
                                                <Typography variant="body2" className={styles.urlDetailLabel}>
                                                    CREATED
                                                </Typography>
                                                <Typography variant="body1" className={styles.urlDetailValue}>
                                                    {formatDate(analytics.createdAt)}
                                                </Typography>
                                            </Box>
                                            <Box className={styles.urlDetailItem}>
                                                <Typography variant="body2" className={styles.urlDetailLabel}>
                                                    LAST ACCESSED
                                                </Typography>
                                                <Typography variant="body1" className={styles.urlDetailValue}>
                                                    {analytics.lastAccessedAt ? formatDate(analytics.lastAccessedAt) : "Never"}
                                                </Typography>
                                            </Box>
                                            <Box className={styles.urlDetailItem}>
                                                <Typography variant="body2" className={styles.urlDetailLabel}>
                                                    STATUS
                                                </Typography>
                                                <Chip
                                                    label={analytics.isExpired ? "Expired" : "Active"}
                                                    color={analytics.isExpired ? "error" : "success"}
                                                    size="small"
                                                    className={styles.statusChip}
                                                />
                                            </Box>
                                            {analytics.expiryDate && (
                                                <Box className={styles.urlDetailItem}>
                                                    <Typography variant="body2" className={styles.urlDetailLabel}>
                                                        EXPIRES
                                                    </Typography>
                                                    <Typography variant="body1" className={styles.urlDetailValue}>
                                                        {formatDate(analytics.expiryDate)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UrlAnalytics;
