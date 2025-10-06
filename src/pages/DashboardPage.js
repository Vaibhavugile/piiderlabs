import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Assuming these are imported from a utility file in a real app
import { fetchUserOrders, formatDate } from '../utils/orderUtils';
import './DashboardPage.css';

// 🚨 FIREBASE IMPORTS 🚨
// Import the db instance from the provided firebase.js file
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- GLOBAL CONSTANTS & FIREBASE SETUP ---
// Using the project ID from firebase.js for context, though it's not needed for the new path
const appId = 'pidr-c644e'; 

if (!db) {
    console.error("Firestore DB instance not available. Check the import from ../firebase.");
}
// ----------------------------------------------------

// --- MENU DEFINITION ---
// Used to generate the navigation structure
const dashboardMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'my-profile', label: 'My Profile', icon: '👤', path: '/settings' },
    { id: 'family-members', label: 'Family Members', icon: '👨‍👩‍👧‍👦' },
    { id: 'manage-addresses', label: 'Manage Addresses', icon: '📍' },
    { id: 'order-history', label: 'Order History', icon: '📜', path: '/orders' },
    { id: 'my-reports', label: 'My Reports', icon: '🩺', path: '/reports' },
];

// --- PROFILE UTILITY FUNCTIONS ---

const getUserProfileRef = (userId) => {
    if (!db) return null;
    
    // ✅ FIX: Set reference to the top-level 'users' collection 
    // and use the userId as the document ID.
    // This will save the addresses/familyMembers arrays as fields on the user's document.
    const profilesCollection = collection(db, 'users');
    return doc(profilesCollection, userId); 
};

const fetchUserProfile = (userId, callback) => {
    const docRef = getUserProfileRef(userId);
    if (!docRef) {
        console.warn("User profile ref is null, DB not ready or user ID is missing.");
        return () => {};
    }

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            // If the user document doesn't exist yet, return empty data
            callback({ addresses: [], familyMembers: [] });
        }
    }, (error) => {
        console.error("Error fetching user profile:", error);
        callback({ addresses: [], familyMembers: [] });
    });

    return unsubscribe;
};

const saveUserProfile = async (userId, data) => {
    const docRef = getUserProfileRef(userId);
    if (!docRef) throw new Error("Database not ready.");

    try {
        // use setDoc with { merge: true } to update only the fields provided (addresses/familyMembers)
        // without overwriting existing user data like email, name, etc.
        await setDoc(docRef, data, { merge: true });
        console.log("User profile saved successfully.");
    } catch (error) {
        console.error("Error saving user profile:", error);
        throw new Error("Failed to save profile data.");
    }
};


// --- FORMS & MODALS ---

const AddressForm = ({ onSave, initialData, onClose }) => {
    // FIX 1: Safely access properties by providing a default empty object for null initialData
    const data = initialData || {};
    
    const [address, setAddress] = useState(data.address || '');
    const [pincode, setPincode] = useState(data.pincode || '');
    const [label, setLabel] = useState(data.label || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = data.id || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        onSave({ id, address, pincode, label });
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <input 
                type="text" 
                placeholder="Label (e.g., Home, Office)" 
                value={label} 
                onChange={(e) => setLabel(e.target.value)} 
                required 
            />
            <textarea 
                placeholder="Full Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
            />
            <input 
                type="text" 
                placeholder="Pincode" 
                value={pincode} 
                onChange={(e) => setPincode(e.target.value)} 
                required 
            />
            <div className="form-actions">
                <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
                <button type="submit" className="primary-button">Save Address</button>
            </div>
        </form>
    );
};

const FamilyMemberForm = ({ onSave, initialData, onClose }) => {
    // FIX 2: Safely access properties by providing a default empty object for null initialData
    const data = initialData || {};

    const [name, setName] = useState(data.name || '');
    const [relationship, setRelationship] = useState(data.relationship || '');
    const [age, setAge] = useState(data.age || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = data.id || `member-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        onSave({ id, name, relationship, age: parseInt(age) });
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
            />
            <input 
                type="text" 
                placeholder="Relationship (e.g., Spouse, Child)" 
                value={relationship} 
                onChange={(e) => setRelationship(e.target.value)} 
                required 
            />
            <input 
                type="number" 
                placeholder="Age" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                required 
            />
            <div className="form-actions">
                <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
                <button type="submit" className="primary-button">Save Member</button>
            </div>
        </form>
    );
};


// --- PROFILE MANAGEMENT COMPONENTS ---

const ManageAddressesSection = ({ addresses, isSaving, handleSaveAddress, handleDeleteAddress, setShowAddressModal, setEditingAddress }) => (
    <div className="section-content-wrapper">
        <h2 className="section-title">Manage Saved Addresses 📍</h2>
        <p className="section-description">Save multiple addresses for quick and easy sample collection scheduling.</p>
        <div className="profile-list-container">
            <div className="profile-list">
                {addresses.length === 0 ? (
                    <div className="empty-profile-state">No addresses saved yet.</div>
                ) : (
                    addresses.map(addr => (
                        <div key={addr.id} className="profile-item">
                            <span className="label-badge">{addr.label}</span>
                            <p className="address-text">{addr.address}, {addr.pincode}</p>
                            <div className="item-actions">
                                <button onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="delete-btn">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        <button 
            className="primary-button add-btn" 
            onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
            disabled={isSaving}
        >
            + Add New Address
        </button>
    </div>
);

const ManageFamilySection = ({ familyMembers, isSaving, handleSaveMember, handleDeleteMember, setShowFamilyModal, setEditingMember }) => (
    <div className="section-content-wrapper">
        <h2 className="section-title">Family Members 👨‍👩‍👧‍👦</h2>
        <p className="section-description">Add and manage profiles of your family members to book tests for them seamlessly.</p>
        <div className="profile-list-container">
            <div className="profile-list">
                {familyMembers.length === 0 ? (
                    <div className="empty-profile-state">No family members added yet.</div>
                ) : (
                    familyMembers.map(member => (
                        <div key={member.id} className="profile-item">
                            <span className="label-badge member-label">{member.relationship}</span>
                            <p className="member-info"><strong>{member.name}</strong> ({member.age} years)</p>
                            <div className="item-actions">
                                <button onClick={() => { setEditingMember(member); setShowFamilyModal(true); }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDeleteMember(member.id)} className="delete-btn">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        <button 
            className="primary-button add-btn" 
            onClick={() => { setEditingMember(null); setShowFamilyModal(true); }}
            disabled={isSaving}
        >
            + Add Family Member
        </button>
    </div>
);


// --- MAIN DASHBOARD COMPONENT ---

const DashboardPage = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    
    // --- STATE ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // NEW: Active section for the main content area, defaults to 'dashboard'
    const [activeSection, setActiveSection] = useState('dashboard'); 
    
    // --- MODAL STATE ---
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [editingMember, setEditingMember] = useState(null);


    // --- EFFECTS ---

    // 1. FETCH ORDERS (Data needed for dashboard summary)
    useEffect(() => {
        const loadOrders = async () => {
            if (!currentUser?.uid) { if (loading) setLoading(false); return; }
            setLoading(true);
            try {
                // Assuming fetchUserOrders is available via orderUtils
                const fetchedOrders = await fetchUserOrders(currentUser.uid); 
                setOrders(fetchedOrders);
            } catch (err) {
                console.error("Failed to load orders:", err);
                setError("An unexpected error occurred while loading data.");
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [currentUser?.uid]);


    // 2. FETCH PROFILE DATA (Addresses/Family Members)
    useEffect(() => {
        if (!currentUser?.uid) return;

        const handleProfileData = (data) => {
            // Data is stored directly on the user's document now
            setAddresses(data.addresses || []);
            setFamilyMembers(data.familyMembers || []);
        };

        const unsubscribe = fetchUserProfile(currentUser.uid, handleProfileData);
        return () => unsubscribe(); 
    }, [currentUser?.uid]);
    
    
    // --- PROFILE HANDLERS ---
    
    const handleSaveAddress = async (newAddress) => {
        setIsSaving(true);
        const isEdit = addresses.some(addr => addr.id === newAddress.id);
        const updatedAddresses = isEdit
            ? addresses.map(addr => addr.id === newAddress.id ? newAddress : addr)
            : [...addresses, newAddress];
        
        try {
            // Save the addresses array field to the user's document
            await saveUserProfile(currentUser.uid, { addresses: updatedAddresses });
            setShowAddressModal(false);
        } catch (e) {
            console.error("Save Address Error:", e);
        } finally {
            setIsSaving(false);
            setEditingAddress(null);
        }
    };

    const handleDeleteAddress = async (id) => {
        const updatedAddresses = addresses.filter(addr => addr.id !== id);
        try {
            await saveUserProfile(currentUser.uid, { addresses: updatedAddresses });
        } catch (e) {
            console.error("Delete Address Error:", e);
        }
    };
    
    const handleSaveMember = async (newMember) => {
        setIsSaving(true);
        const isEdit = familyMembers.some(member => member.id === newMember.id);
        const updatedMembers = isEdit
            ? familyMembers.map(member => member.id === newMember.id ? newMember : member)
            : [...familyMembers, newMember];
        
        try {
            // Save the familyMembers array field to the user's document
            await saveUserProfile(currentUser.uid, { familyMembers: updatedMembers });
            setShowFamilyModal(false);
        } catch (e) {
            console.error("Save Member Error:", e);
        } finally {
            setIsSaving(false);
            setEditingMember(null);
        }
    };
    
    const handleDeleteMember = async (id) => {
        const updatedMembers = familyMembers.filter(member => member.id !== id);
        try {
            await saveUserProfile(currentUser.uid, { familyMembers: updatedMembers });
        } catch (e) {
            console.error("Delete Member Error:", e);
        }
    };
    
    // --- DERIVED STATE ---
    const upcomingOrder = useMemo(() => 
        orders.find(o => o.status === 'Confirmed' || o.status === 'Pending Collection'), 
        [orders]
    );
    const latestReport = useMemo(() => 
        orders.find(o => o.status === 'Report Ready'), 
        [orders]
    );
    
    
    // --- CONTENT RENDERER ---
    const renderContent = () => {
        // Find the active menu item to check for external paths
        const activeMenuItem = dashboardMenu.find(item => item.id === activeSection);

        // Handle navigation for items with 'path' and allow internal section rendering
        if (activeMenuItem && activeMenuItem.path) {
            // For external navigation, we can just navigate immediately and return a loading/placeholder
            if (activeSection === 'my-profile' || activeSection === 'order-history' || activeSection === 'my-reports') {
                navigate(activeMenuItem.path);
                return <div className="loading-state">Redirecting to {activeMenuItem.label}...</div>;
            }
        }

        switch (activeSection) {
            case 'manage-addresses':
                return (
                    <ManageAddressesSection 
                        addresses={addresses} 
                        isSaving={isSaving} 
                        handleSaveAddress={handleSaveAddress} 
                        handleDeleteAddress={handleDeleteAddress}
                        setShowAddressModal={setShowAddressModal}
                        setEditingAddress={setEditingAddress}
                    />
                );
            case 'family-members':
                return (
                    <ManageFamilySection 
                        familyMembers={familyMembers}
                        isSaving={isSaving} 
                        handleSaveMember={handleSaveMember}
                        handleDeleteMember={handleDeleteMember}
                        setShowFamilyModal={setShowFamilyModal}
                        setEditingMember={setEditingMember}
                    />
                );
            case 'dashboard':
            default:
                return (
                    <div className="dashboard-summary-grid">
                        
                        {/* 1. UPCOMING APPOINTMENT */}
                        <section className="dashboard-card upcoming-card">
                            <h2>Upcoming Appointment 📅</h2>
                            {upcomingOrder ? (
                                <div className="upcoming-details">
                                    <span className={`status-badge pending`}>{upcomingOrder.status}</span>
                                    <p><strong>Collection Date:</strong> {formatDate(upcomingOrder.bookingDetails?.collectionDate)}</p>
                                    <p><strong>Tests:</strong> {upcomingOrder.items.length} item(s)</p>
                                    <button 
                                        className="primary-button cta-button"
                                        onClick={() => navigate(`/orders/${upcomingOrder.id}`)}
                                    >
                                        View/Manage Booking →
                                    </button>
                                </div>
                            ) : (
                                <p className="no-data">No upcoming appointments. <a href="/">Book a Test Now.</a></p>
                            )}
                        </section>
                        
                        {/* 2. LATEST REPORT */}
                        <section className="dashboard-card report-card">
                            <h2>Latest Report 🩺</h2>
                            {latestReport ? (
                                <div className="report-details">
                                    <p>Report ready for order **#{latestReport.id.substring(0, 8)}**</p>
                                    <button 
                                        className="secondary-button cta-button"
                                        onClick={() => navigate('/reports')} 
                                    >
                                        View Reports →
                                    </button>
                                </div>
                            ) : (
                                <p className="no-data">Your reports will appear here once analysis is complete.</p>
                            )}
                        </section>

                        {/* 3. Quick Links/Stats */}
                        <section className="dashboard-card quick-stats-card">
                            <h2>Profile Stats</h2>
                            <div className="stat-grid">
                                <div className="stat-item" onClick={() => setActiveSection('manage-addresses')}>
                                    <h3>{addresses.length}</h3>
                                    <p>Saved Addresses</p>
                                </div>
                                <div className="stat-item" onClick={() => setActiveSection('family-members')}>
                                    <h3>{familyMembers.length}</h3>
                                    <p>Family Profiles</p>
                                </div>
                                <div className="stat-item" onClick={() => navigate('/orders')}>
                                    <h3>{orders.length}</h3>
                                    <p>Total Orders</p>
                                </div>
                            </div>
                        </section>
                    </div>
                );
        }
    };

    if (loading) {
        return <div className="loading-state">Loading dashboard...</div>;
    }

    // --- MAIN RENDER ---
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Welcome Back, {currentUser?.displayName || 'User'}!</h1>
                    <p>Your personal health management hub. User ID: {currentUser?.uid.substring(0, 10)}...</p>
                </div>
                <button className="primary-button logout-button" onClick={logout}>
                    Logout
                </button>
            </header>

            <main className="dashboard-grid-layout">
                {/* LEFT: Navigation Menu */}
                <nav className="dashboard-menu">
                    {dashboardMenu.map((item) => (
                        <button
                            key={item.id}
                            className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => {
                                // For items with a direct path, use navigate. Otherwise, change internal state.
                                if (item.path) {
                                    navigate(item.path);
                                } else {
                                    setActiveSection(item.id);
                                }
                            }}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* RIGHT: Content Area */}
                <div className="dashboard-content">
                    {renderContent()}
                </div>
            </main>
            
            {/* Modals for Addresses and Family Members */}
            {(showAddressModal || editingAddress) && (
                <div className="modal-overlay" onClick={() => { setShowAddressModal(false); setEditingAddress(null); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingAddress ? 'Edit Saved Address' : 'Add New Address'}</h3>
                        <AddressForm 
                            onSave={handleSaveAddress} 
                            initialData={editingAddress} 
                            onClose={() => { setShowAddressModal(false); setEditingAddress(null); }}
                        />
                    </div>
                </div>
            )}

            {(showFamilyModal || editingMember) && (
                <div className="modal-overlay" onClick={() => { setShowFamilyModal(false); setEditingMember(null); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingMember ? 'Edit Family Member' : 'Add New Family Member'}</h3>
                        <FamilyMemberForm 
                            onSave={handleSaveMember} 
                            initialData={editingMember} 
                            onClose={() => { setShowFamilyModal(false); setEditingMember(null); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;