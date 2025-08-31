import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./styles.module.scss";

const UrlModal = ({ open, onClose, onSuccess, editData = null, mode = "create" }) => {
    const [formData, setFormData] = useState({
        url: "",
        customAlias: ""
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (editData && mode === "edit") {
            setFormData({
                url: editData.redirectUrl || "",
                customAlias: editData.customAlias || ""
            });
        } else {
            setFormData({
                url: "",
                customAlias: ""
            });
        }
        setErrors({});
    }, [editData, mode, open]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.url.trim()) {
            newErrors.url = "URL is required";
        } else {
            try {
                new URL(formData.url.trim());
            } catch {
                newErrors.url = "Please enter a valid URL";
            }
        }

        if (formData.customAlias.trim()) {
            if (formData.customAlias.length < 3) {
                newErrors.customAlias = "Custom alias must be at least 3 characters";
            } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.customAlias)) {
                newErrors.customAlias = "Custom alias can only contain letters, numbers, hyphens, and underscores";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const payload = {
                url: formData.url.trim(),
                customAlias: formData.customAlias.trim() || undefined
            };

            let response;
            if (mode === "edit" && editData) {
                response = await axiosInstance.put(`/urls/${editData.shortId}`, payload);
            } else {
                response = await axiosInstance.post("/shorten", payload);
            }

            if (response.data.success) {
                toast.success(mode === "edit" ? "URL updated successfully!" : "URL shortened successfully!");
                onSuccess();
                onClose();
            } else {
                toast.error(response.data.message || "Operation failed");
            }
        } catch (error) {
            console.error("Error saving URL:", error);
            const errorMessage = error.response?.data?.message || "Failed to save URL. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                        <span className={styles.modalIcon}>
                            {mode === "edit" ? "✏️" : "➕"}
                        </span>
                        <h2>{mode === "edit" ? "Edit URL" : "Create New URL"}</h2>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formField}>
                        <label className={styles.fieldLabel}>
                            Original URL <span className={styles.required}>*</span>
                        </label>
                        <TextField
                            fullWidth
                            value={formData.url}
                            onChange={(e) => handleChange("url", e.target.value)}
                            error={!!errors.url}
                            helperText={errors.url || "Enter the long URL you want to shorten"}
                            placeholder="https://example.com/very-long-url"
                            size="small"
                            className={styles.textField}
                        />
                    </div>

                    <div className={styles.formField}>
                        <label className={styles.fieldLabel}>Custom Alias (Optional)</label>
                        <TextField
                            fullWidth
                            value={formData.customAlias}
                            onChange={(e) => handleChange("customAlias", e.target.value)}
                            error={!!errors.customAlias}
                            helperText={errors.customAlias || "Leave empty for auto-generated alias"}
                            placeholder="my-brand"
                            size="small"
                            className={styles.textField}
                        />
                    </div>

                    <div className={styles.infoMessage}>
                        <span className={styles.infoIcon}>ℹ️</span>
                        <span>
                            {mode === "edit" 
                                ? "Changes will be applied immediately to your existing URL."
                                : "Your shortened URL will be created and added to your dashboard."
                            }
                        </span>
                    </div>

                    <div className={styles.modalActions}>
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            variant="outlined"
                            className={styles.cancelButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading || Object.keys(errors).length > 0}
                            className={styles.submitButton}
                        >
                            {isLoading 
                                ? (mode === "edit" ? "Updating..." : "Creating...") 
                                : (mode === "edit" ? "Update URL" : "Create URL")
                            }
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UrlModal;
