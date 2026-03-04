import React, { useState, useMemo, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import styles from "../styles/profile.module.css";
import Loading from "../components/Loading";
import {useParams} from "react-router-dom";

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default function UserProfile() {
    const [tab, setTab] = useState("overview");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const user_id = useParams().id;
    // image/upload state
    const [preview, setPreview] = useState(null); // local preview URL or server url


    useEffect(() => {
        console.log(user_id);
        const csrfToken = getCookie('csrftoken');
        fetch(`http://localhost:8000/accounts/user_profile/${user_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.user) {
                    setUser(data.user);
                    setPreview(data.user.profilePicture || null);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
                setLoading(false);
            });
    }, [user_id]);

    const isUserSleeping = () => {
        if (!user?.quiet_hours_start || !user?.quiet_hours_end) return false;

        const now = new Date();

        const [startHour, startMinute] = user.quiet_hours_start.split(":").map(Number);
        const [endHour, endMinute] = user.quiet_hours_end.split(":").map(Number);

        const start = new Date();
        start.setHours(startHour, startMinute, 0);

        const end = new Date();
        end.setHours(endHour, endMinute, 0);

        // Handles quiet hours that cross midnight
        if (end < start) {
            if (now >= start) return true;
            const midnight = new Date(start);
            midnight.setHours(24, 0, 0);
            if (now <= end || now >= start) return true;
        }
        return now >= start && now <= end;
    };

    const handleUserAction = async (e, targetUser, action) => {
        e.stopPropagation();
        const csrf = getCookie("csrftoken");
        // Use targetUser.id to ensure we hit the right endpoint
        const url = `http://localhost:8000/accounts/${action}/${targetUser.id}/`;

        try {
            await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: { "X-CSRFToken": csrf },
            });

            // Optimistic UI Update for a SINGLE object
            setUser(prev => {
                if (!prev) return null;

                if (action === 'follow') {
                    return {
                        ...prev,
                        is_following: !prev.private_account,
                        pending_follow: prev.private_account
                    };
                } else {
                    // handles 'unfollow'
                    return {
                        ...prev,
                        is_following: false,
                        is_friend: false,
                        pending_follow: false
                    };
                }
            });
        } catch (err) {
            console.error(`${action} failed:`, err);
        }
    };

    // 3. Protect useMemo from null user
    const filteredObjects = useMemo(() => {
        return user ? user.objects : [];
    }, [user]);


    // 4. THE LOADING GUARD
    if (loading) {
        return <Loading />
    }

    if (!user) {
        return <div className={styles.error}>Could not load user data.</div>;
    }

    return (
        <div className={styles.body}>
            <div className={styles.mainContainer}>
                <Navbar/>

                <div className={styles.container}>
                    {/* Cover Photo */}
                    <div className={styles.coverPhoto}></div>
                    {/* HEADER CARD */}
                    <div className={styles.headerCard}>
                        <div className={styles.headerLayout}>
                            {/* Avatar & Trust Score */}
                            <div className={styles.avatarSection}>
                                <div className={styles.avatarWrapper}>

                                    {/* Avatar Image */}
                                    <div
                                        className={styles.avatar}
                                        style={{
                                            backgroundImage: preview
                                                ? `url(${preview})`
                                                : user.profilePicture
                                                    ? `url(${user.profilePicture})`
                                                    : "url(/defaultImage.png)"
                                        }}
                                    />
                                </div>

                                <div className={styles.trustBadge}>
                                    <span className={styles.trustIcon}>🛡️</span>
                                    <span className={styles.trustValue}>{user.trustScore}% Trust</span>
                                </div>
                            </div>

                            <div className={styles.actionWrapper}>
                                {(user.is_friend || !user.private_account) && (
                                    <button className={styles.msgBtn} >
                                        DM
                                    </button>
                                )}
                                {user.is_friend || user.is_following ? (
                                    <button className={styles.unfollowBtn} onClick={(e) => handleUserAction(e, user, 'unfollow')}>
                                        Unfollow
                                    </button>
                                ) : user.pending_follow ? (
                                    <button className={styles.pendingBtn} onClick={(e) => handleUserAction(e, user, 'unfollow')}>
                                        Cancel
                                    </button>
                                ) : (
                                    <button className={styles.followBtn} onClick={(e) => handleUserAction(e, user, 'follow')}>
                                        {user.private_account ? "Request" : "Follow"}
                                    </button>
                                )}
                            </div>
                            {/* Profile Info / Edit Form */}
                            <div className={styles.profileInfo}>

                                    <div className={styles.infoContent}>

                                        <div className={styles.statusBottomRight}>
                                            <div className={styles.statusRowInline}>

                                                <div className={styles.statusItem}>
                                                <span
                                                    className={
                                                        user.onlineStatus === "online"
                                                            ? styles.statusOnline
                                                            : user.onlineStatus === "away"
                                                                ? styles.statusAway
                                                                : user.onlineStatus === "do_not_disturb"
                                                                    ? styles.statusDnd
                                                                    : styles.statusOffline
                                                    }
                                                >
                                                 ●
                                                </span>

                                                    <span className={styles.statusText}>
                {user.onlineStatus?.replace("_", " ")}
            </span>
                                                </div>

                                                {user.quiet_hours_start &&
                                                    user.quiet_hours_end &&
                                                    isUserSleeping() && (
                                                        <div className={styles.sleepingBadge}>
                                                            😴 Sleeping
                                                        </div>
                                                    )}

                                            </div>
                                        </div>

                                        <div className={styles.titleRow}>
                                            <h1 className={styles.title}>
                                                {user.firstName} {user.lastName}
                                            </h1>

                                            {user.isVerified && (
                                                <span className={styles.verified}>✓ Verified</span>
                                            )}
                                        </div>

                                        <p className={styles.username}>
                                            @{user.username} • {user.email}
                                        </p>

                                        <p className={styles.biography}>
                                            {user.biography}
                                        </p>
                                    </div>
                            </div>
                        </div>
                    </div>

                    {/* SEGMENTED TABS (unchanged) */}
                    <div className={styles.tabsContainer}>
                        <div className={styles.tabs}>
                            {[
                                {key: "overview", label: "Overview"},
                                {key: "skills", label: "Skills"},
                                {key: "objects", label: "User Objects"},
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    className={tab === t.key ? styles.activeTab : styles.tab}
                                    onClick={() => setTab(t.key)}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TAB CONTENT (unchanged) */}
                    <div className={styles.contentArea}>
                        {tab === "overview" && (
                            <div className={styles.statsGrid}>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Items Listed</span>
                                    <span className={styles.statValue}></span>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Active Loans</span>
                                    <span className={styles.statValue}></span>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Endorsements</span>
                                    <span className={styles.statValue}></span>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Trust Score</span>
                                    <span className={styles.statValue}>{user.trustScore}%</span>
                                </div>
                            </div>
                        )}

                        {tab === "skills" && (
                            <div className={styles.card}>
                                <h2 className={styles.sectionTitle}>Skills & Expertise</h2>


                                <div className={styles.skillGrid}>
                                    {user.skills.map((skill) => (
                                        <div key={skill.id} className={styles.skillCard}>
                                            <div>
                                                <span className={styles.skillName}>{skill.name}</span>
                                                <span className={styles.skillLevel}> — {skill.proficiency_level}</span>
                                            </div>
                                            <div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === "objects" && (
                            <div className={styles.card}>
                                <h2 className={styles.sectionTitle}>Available Objects</h2>


                                <div className={styles.objectGrid}>
                                    {filteredObjects.map((obj) => (
                                        <div key={obj.id} className={styles.objectCard}>
                                            <div className={styles.objectImage}>
                                                <span className={styles.imagePlaceholder}>📸</span>
                                            </div>
                                            <div className={styles.objectInfo}>
                                                <h3 className={styles.objectName}>{obj.name}</h3>
                                                <div className={styles.objectMeta}>
                                                    <span className={styles.price}>${obj.price_per_day}/day</span>
                                                    <span
                                                        className={obj.isAvailable ? styles.availableBadge : styles.unavailableBadge}>
                                                        {obj.isAvailable ? "Available" : "In Use"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}