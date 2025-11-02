import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore, addDoc, onSnapshot, collection, setLogLevel, 
    query, where, updateDoc, doc
} from 'firebase/firestore';
import { 
    PiggyBank, Search, Plus, DollarSign, Users, Calendar, Settings, Clock, Zap, User, ArrowLeft, AlertTriangle, X, TrendingUp, TrendingDown 
} from 'lucide-react';

// --- ENVIRONMENT & FIREBASE INITIALIZATION SETUP ---

// Mandatory global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-sscu-app';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


// Define the root component
const App = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    const [currentView, setCurrentView] = useState('Dashboard'); 
    const [customers, setCustomers] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modals & Drawers
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    // RENAMED: from isTransactionModalOpen to isTransactionDrawerOpen
    const [isTransactionDrawerOpen, setIsTransactionDrawerOpen] = useState(false); 
    const [isDeductionConfirmationOpen, setIsDeductionConfirmationOpen] = useState(false); 
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false); 
    const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false); 

    // State for transaction and repayment flows
    const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState(null); 
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);

    // Deduction View State
    const [deductionAmount, setDeductionAmount] = useState('');
    const [selectedDeductionIds, setSelectedDeductionIds] = useState([]);
    const [deductionPendingData, setDeductionPendingData] = useState({ amount: 0, customerIds: [] }); 


    // --- UTILITIES ---

    // Function to determine the correct Firestore path for private user data.
    const getCollectionPath = useCallback((uid) => {
        return `artifacts/${appId}/users/${uid}/customers`;
    }, []);

    // Function to determine the correct Firestore path for transactions.
    const getTransactionCollectionPath = useCallback((uid) => {
        return `artifacts/${appId}/users/${uid}/transactions`;
    }, []);

    // Function to determine the correct Firestore path for loans.
    const getLoanCollectionPath = useCallback((uid) => {
        return `artifacts/${appId}/users/${uid}/loans`;
    }, []);

    // Function to handle temporary user messages
    const displayMessage = (message, isError = false) => {
        // Simple internal log/error display (replaces alert/confirm)
        setError(isError ? message : null);
        console.log(message);
        setTimeout(() => setError(null), 5000);
    };

    // --- FIREBASE INITIALIZATION AND AUTHENTICATION ---

    useEffect(() => {
        try {
            if (!firebaseConfig.apiKey) {
                console.warn("Firebase config is missing API key. Data will not persist.");
                setLoading(false);
                setIsAuthReady(true);
                return;
            }
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            setDb(firestore);
            setAuth(authInstance);
            setLogLevel('Debug'); // Enable debug logging

            // Handle Authentication State
            const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
                let currentUserId = user ? user.uid : null;
                
                if (!user) {
                    try {
                        if (initialAuthToken) {
                            const userCredential = await signInWithCustomToken(authInstance, initialAuthToken);
                            currentUserId = userCredential.user.uid;
                        } else {
                            const userCredential = await signInAnonymously(authInstance);
                            currentUserId = userCredential.user.uid;
                        }
                    } catch (e) {
                        console.error("Authentication failed:", e);
                        displayMessage("Authentication failed. Data will not save.", true);
                        setIsAuthReady(true);
                        return;
                    }
                }
                
                setUserId(currentUserId);
                setIsAuthReady(true);
                setLoading(false);
            });

            return () => {
                if (unsubscribeAuth) unsubscribeAuth();
            };

        } catch (e) {
            console.error("Firebase initialization failed:", e);
            displayMessage(`Initialization error: ${e.message}`, true);
            setLoading(false);
        }
    }, [getCollectionPath, initialAuthToken, firebaseConfig]);

    // --- REAL-TIME DATA LISTENER (Customers) ---

    useEffect(() => {
        let unsubscribeSnapshot = null;
        if (db && userId && isAuthReady) {
            setLoading(true);
            const path = getCollectionPath(userId);
            const q = collection(db, path);

            // Set up the real-time listener
            unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const fetchedCustomers = [];
                snapshot.forEach((doc) => {
                    fetchedCustomers.push({ id: doc.id, ...doc.data() });
                });
                
                fetchedCustomers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                setCustomers(fetchedCustomers);
                setLoading(false);
            }, (err) => {
                console.error("Error setting up customer listener:", err);
                displayMessage(`Error fetching customers: ${err.message}`, true);
                setLoading(false);
            });
        } else if (isAuthReady && !userId) {
            setLoading(false);
        }

        return () => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, [db, userId, isAuthReady, getCollectionPath]);

    // --- REAL-TIME DATA LISTENER (Loans) ---

    useEffect(() => {
        let unsubscribeSnapshot = null;
        if (db && userId && isAuthReady) {
            const path = getLoanCollectionPath(userId);
            const q = collection(db, path);

            unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const fetchedLoans = [];
                snapshot.forEach((doc) => {
                    // Convert Firestore timestamp to JS Date if necessary
                    const data = doc.data();
                    const startDate = data.startDate?.toDate ? data.startDate.toDate() : new Date();
                    fetchedLoans.push({ id: doc.id, ...data, startDate });
                });
                
                // Sort by creation date/start date (descending)
                fetchedLoans.sort((a, b) => b.startDate - a.startDate);

                setLoans(fetchedLoans);
            }, (err) => {
                console.error("Error setting up loan listener:", err);
                displayMessage(`Error fetching loans: ${err.message}`, true);
            });
        }

        return () => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, [db, userId, isAuthReady, getLoanCollectionPath]);


    // --- REAL-TIME DATA LISTENER (Transactions) ---

    useEffect(() => {
        let unsubscribeSnapshot = null;
        if (db && userId && isAuthReady && selectedCustomer) {
            const path = getTransactionCollectionPath(userId);
            
            // Query transactions specific to the selected customer
            const q = query(
                collection(db, path),
                where('customerId', '==', selectedCustomer.id)
            );

            unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const fetchedTransactions = [];
                snapshot.forEach((doc) => {
                    fetchedTransactions.push({ id: doc.id, ...doc.data() });
                });
                
                // Sort by date/timestamp manually (descending)
                fetchedTransactions.sort((a, b) => (b.date?.toDate() || b.createdAt) - (a.date?.toDate() || a.createdAt));

                setTransactions(fetchedTransactions);
            }, (err) => {
                console.error("Error setting up transaction listener:", err);
                displayMessage(`Error fetching transactions: ${err.message}`, true);
            });
        } else {
            setTransactions([]); // Clear transactions if no customer selected
        }

        return () => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, [db, userId, isAuthReady, selectedCustomer, getTransactionCollectionPath]);

    // --- DATA HANDLING: CUSTOMERS ---

    const handleAddCustomer = async (newCustomer) => {
        if (!userId) {
            displayMessage("System not authenticated. Cannot add customer.", true);
            return;
        }

        try {
            await addDoc(collection(db, getCollectionPath(userId)), {
                ...newCustomer, // Now only contains name, accountNo
                balance: 0.00, // Initialize savings balance to 0.00
                createdAt: new Date(),
            });
            displayMessage(`Customer added: ${newCustomer.name}`);
            setIsCustomerModalOpen(false); // Auto-cut/close on success
        } catch (e) {
            console.error("Error adding document: ", e);
            displayMessage(`Error adding customer: ${e.message}`, true);
        }
    };

    // --- DATA HANDLING: TRANSACTIONS ---

    const handleAddTransaction = async (customerId, transactionData) => {
        if (!userId || !db) {
            displayMessage("System not authenticated. Cannot record transaction.", true);
            return;
        }

        // transactionData now includes the 'date' field from the drawer
        const { amount, type, description, date } = transactionData; 

        // 1. Record the Transaction
        try {
            await addDoc(collection(db, getTransactionCollectionPath(userId)), {
                customerId,
                amount,
                type,
                description,
                date: date, // Use the date/time from the drawer
            });

            // 2. Update Customer Savings Balance
            const customerRef = doc(db, getCollectionPath(userId), customerId);
            const customer = customers.find(c => c.id === customerId);
            
            if (customer) {
                let newBalance = customer.balance || 0;
                if (type === 'cash_in') {
                    newBalance += amount;
                } else if (type === 'cash_out') {
                    newBalance -= amount;
                }

                await updateDoc(customerRef, {
                    balance: newBalance,
                });

                displayMessage(`Transaction recorded and balance updated for Customer ID: ${customerId}.`);
                setIsTransactionDrawerOpen(false); // Auto-cut/close drawer on success
            } else {
                console.error("Customer not found during transaction update.");
                displayMessage("Error: Customer not found locally. Transaction recorded but balance update failed.", true);
            }
        } catch (e) {
            console.error("Error processing transaction: ", e);
            displayMessage(`Error processing transaction: ${e.message}`, true);
        }
    };

    // --- DATA HANDLING: LOANS ---
    
    const handleAddLoan = async (loanData) => {
        if (!userId || !db) {
            displayMessage("System not authenticated. Cannot record loan.", true);
            return;
        }

        const { customerId, principal, termMonths, interestRate, startDate } = loanData;

        try {
            const principalAmount = parseFloat(principal);
            const outstandingBalance = principalAmount; // Initially, outstanding balance equals principal

            // Simple Monthly Payment Calculation (Principal only, no amortization)
            const monthlyPaymentEstimate = (principalAmount / parseInt(termMonths, 10)) + 
                                            ((principalAmount * parseFloat(interestRate) / 100) / parseInt(termMonths, 10)); // Simple Interest approximation
            // Note: This is a basic approximation for display. Real amortization is more complex.

            // 1. Record the Loan document
            await addDoc(collection(db, getLoanCollectionPath(userId)), {
                customerId,
                principal: principalAmount,
                outstandingBalance: outstandingBalance,
                termMonths: parseInt(termMonths, 10),
                interestRate: parseFloat(interestRate),
                startDate: startDate,
                monthlyPaymentEstimate: monthlyPaymentEstimate.toFixed(2),
                status: 'Active', // Default status
                createdAt: new Date(),
            });

            displayMessage(`Loan of GHS${principalAmount.toFixed(2)} recorded successfully.`);
            setIsLoanModalOpen(false);
        } catch (e) {
            console.error("Error adding loan: ", e);
            displayMessage(`Error recording loan: ${e.message}`, true);
        }
    };

    // NEW: Function to handle loan repayment
    const handleRepayLoan = async (loanId, repaymentAmount, description) => {
        if (!userId || !db) {
            displayMessage("System not authenticated. Cannot record repayment.", true);
            return;
        }

        try {
            const loanRef = doc(db, getLoanCollectionPath(userId), loanId);
            const loan = loans.find(l => l.id === loanId);
            
            if (!loan) {
                displayMessage("Error: Loan not found.", true);
                return;
            }

            // Calculate new outstanding balance, ensuring it doesn't go below zero
            const newOutstandingBalance = Math.max(0, (loan.outstandingBalance || 0) - repaymentAmount);
            // Determine status
            const status = newOutstandingBalance <= 0.01 ? 'Completed' : 'Active';

            // 1. Update Loan Outstanding Balance and Status
            await updateDoc(loanRef, {
                outstandingBalance: newOutstandingBalance,
                status: status,
                lastPaymentDate: new Date(), // Record the last payment date
            });

            // 2. Record the Repayment as a Cash In transaction (for customer record/audit)
            await addDoc(collection(db, getTransactionCollectionPath(userId)), {
                customerId: loan.customerId,
                amount: repaymentAmount,
                type: 'cash_in', // Repayment is an inflow of funds to the institution
                description: description || `Loan Repayment - Loan ID: ${loanId.substring(0, 8)}`,
                date: new Date(),
            });

            displayMessage(`Loan repayment of GHS${repaymentAmount.toFixed(2)} recorded successfully. Outstanding balance: GHS${newOutstandingBalance.toFixed(2)}.`);
            // Auto-cut/close on success
            setIsRepaymentModalOpen(false); 
            setSelectedLoanForRepayment(null);
        } catch (e) {
            console.error("Error processing loan repayment: ", e);
            displayMessage(`Error processing loan repayment: ${e.message}`, true);
        }
    };


    // --- DATA HANDLING: DEDUCTIONS ---

    const toggleCustomerSelection = (customerId) => {
        setSelectedDeductionIds(prev =>
            prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const confirmDeduction = async () => {
        const { amount, customerIds } = deductionPendingData;
        
        setIsDeductionConfirmationOpen(false); // Close confirmation modal immediately

        let successfulUpdates = 0;
        let failedUpdates = 0;

        for (const customerId of customerIds) {
            try {
                // 1. Update Customer Balance
                const customerRef = doc(db, getCollectionPath(userId), customerId);
                const customer = customers.find(c => c.id === customerId);
                
                if (customer) {
                    const newBalance = (customer.balance || 0) - amount;

                    await updateDoc(customerRef, {
                        balance: newBalance,
                    });

                    // 2. Record the Deduction (Cash Out Transaction)
                    await addDoc(collection(db, getTransactionCollectionPath(userId)), {
                        customerId,
                        amount: amount,
                        type: 'cash_out',
                        description: `Monthly Deduction - GHS${amount.toFixed(2)}`,
                        date: new Date(),
                    });
                    successfulUpdates++;
                }
            } catch (e) {
                console.error(`Error processing deduction for ${customerId}:`, e);
                failedUpdates++;
            }
        }
        
        // Auto-cut: Clear form states after processing, whether successful or not
        setDeductionAmount('');
        setSelectedDeductionIds([]);
        setDeductionPendingData({ amount: 0, customerIds: [] });

        displayMessage(`Deduction process complete. ${successfulUpdates} customer(s) updated successfully. ${failedUpdates} failed.`);
    };


    const handleProcessDeduction = () => {
        if (!userId || !db) {
            displayMessage("System not authenticated. Cannot process deduction.", true);
            return;
        }
        const amount = parseFloat(deductionAmount);
        if (isNaN(amount) || amount <= 0 || selectedDeductionIds.length === 0) {
            displayMessage("Please enter a valid amount (GHS) and select at least one customer.", true);
            return;
        }
        
        setDeductionPendingData({ amount, customerIds: selectedDeductionIds });
        setIsDeductionConfirmationOpen(true);
    };

    // --- CALCULATED VALUES FOR DASHBOARD ---
    
    const calculateDashboardTotals = () => {
        const customerCount = customers.length;
        const totalSavingsBalance = customers.reduce((sum, customer) => sum + (customer.balance || 0), 0);
        const totalLoanPrincipal = loans.reduce((sum, loan) => sum + (loan.principal || 0), 0);
        const totalOutstandingLoan = loans.reduce((sum, loan) => sum + (loan.outstandingBalance || 0), 0);
        
        return {
            totalSavingsBalance: totalSavingsBalance.toFixed(2), 
            totalLoanPrincipal: totalLoanPrincipal.toFixed(2),
            totalOutstandingLoan: totalOutstandingLoan.toFixed(2),
            customerCount: customerCount
        };
    };

    const dashboardTotals = calculateDashboardTotals();

    // --- NAVIGATION & CUSTOMER SELECTION ---
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCurrentView('Customer Detail');
    };

    const handleBackToCashBook = () => {
        setCurrentView('Cash Book');
        setSelectedCustomer(null);
        setIsTransactionDrawerOpen(false); // Ensure drawer is closed
    };

    // --- COMPONENTS ---

    // 1. Navigation Component
    const NavTab = ({ name, icon: Icon }) => (
        <button
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition duration-200 
                ${currentView === name 
                    ? 'bg-[#0e1625] text-green-400 font-semibold' 
                    : 'text-gray-400 hover:text-white hover:bg-[#0e1625]'}`}
            onClick={() => {
                setCurrentView(name);
                setSelectedCustomer(null); // Clear selection when navigating away from detail view
                setIsTransactionDrawerOpen(false); // Close drawer
            }}
        >
            <Icon size={18} />
            <span>{name}</span>
        </button>
    );

    const navItems = [
        { name: 'Dashboard', icon: Calendar },
        { name: 'Cash Book', icon: DollarSign },
        { name: 'Monthly Deduction', icon: Users },
        { name: 'Loan Management', icon: PiggyBank }, 
        { name: 'App Settings', icon: Settings },
    ];

    // 2. Card Component
    const StatCard = ({ title, value, colorClass = 'text-green-400' }) => (
        <div className="bg-[#1a2333] p-6 rounded-xl shadow-lg flex-1 min-w-40">
            <h3 className="text-gray-400 text-md font-medium mb-1">{title}</h3>
            <p className={`text-3xl sm:text-4xl font-extrabold ${colorClass}`}>
                {/* Use GHS for currency titles, otherwise use raw value */}
                {title.includes('Count') || title.includes('Rate') ? value : `GHS${parseFloat(value).toFixed(2)}`}
            </p>
        </div>
    );

    // 3. Modals & Drawer

    const ModalBase = ({ title, children, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2333] p-8 rounded-xl w-full max-w-lg shadow-2xl relative">
                <h3 className="text-2xl font-semibold text-white mb-6">{title}</h3>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <Plus size={24} className="transform rotate-45" />
                </button>
                {children}
            </div>
        </div>
    );
    
    // UPDATED: Removed phone and business fields. Auto-cut logic confirmed in handleAddCustomer.
    const NewCustomerModal = ({ onSubmit, onClose }) => {
        const [name, setName] = useState('');
        const [accountNo, setAccountNo] = useState('');

        const handleSubmit = (e) => {
            e.preventDefault();
            if (name) {
                // Only sending name and accountNo
                onSubmit({ name, accountNo });
            } else {
                displayMessage('Customer Full Name is required.', true);
            }
        };

        return (
            <ModalBase title="Add New Customer/Account" onClose={onClose}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Customer Full Name (Required)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Account No. (Optional)"
                        value={accountNo}
                        onChange={(e) => setAccountNo(e.target.value)}
                        className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                    />
                    <p className="text-sm text-gray-500 pt-2">
                        A new customer will be created with an initial **GHS0.00 Balance**.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                        >
                            Create Customer
                        </button>
                    </div>
                </form>
            </ModalBase>
        );
    };

    // NEW COMPONENT: Transaction Drawer (replaces NewTransactionModal)
    const TransactionDrawer = ({ customer, onSubmit, onClose }) => {
        const now = new Date();
        
        // Form states
        const [amount, setAmount] = useState('');
        const [type, setType] = useState('cash_in');
        const [description, setDescription] = useState('');
        
        // Editable date/time states
        const [transactionDate, setTransactionDate] = useState(now.toISOString().substring(0, 10)); // YYYY-MM-DD
        const [transactionTime, setTransactionTime] = useState(now.toTimeString().substring(0, 5)); // HH:MM
    
        const handleSubmit = (e) => {
            e.preventDefault();
            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                displayMessage('Please enter a valid positive amount (GHS).', true);
                return;
            }

            // Combine date and time into a single Date object for Firestore
            const combinedDateTimeString = `${transactionDate}T${transactionTime}:00`;
            const transactionDateTime = new Date(combinedDateTimeString);

            if (isNaN(transactionDateTime.getTime())) {
                displayMessage('Invalid date or time selected.', true);
                return;
            }
    
            onSubmit(customer.id, {
                amount: numericAmount,
                type: type,
                description: description,
                date: transactionDateTime, // Use the provided date/time
            });
        };
    
        return (
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-black bg-opacity-75 transition-opacity duration-300"
                    onClick={onClose}
                ></div>
                <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-[#1a2333] shadow-2xl p-6 transform translate-x-0 transition-transform duration-300">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                        <h3 className="text-xl font-semibold text-white">New Transaction</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <p className="text-gray-300 mb-6">
                        Account: <span className="font-bold text-green-400">{customer.name}</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Transaction Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                            >
                                <option value="cash_in">Cash In (Deposit)</option>
                                <option value="cash_out">Cash Out (Withdrawal/Deduction)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1">Amount (GHS)</label>
                            <input
                                type="number"
                                placeholder="Amount (GHS) (Required)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                                step="0.01"
                                min="0.01"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={transactionDate}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                    className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={transactionTime}
                                    onChange={(e) => setTransactionTime(e.target.value)}
                                    className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                                    required
                                />
                            </div>
                        </div>

                        <textarea
                            placeholder="Description (e.g., Monthly contribution, Loan repayment)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400 h-24"
                        />
                        
                        <div className="flex justify-end space-x-3 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                            >
                                Record Entry
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const DeductionConfirmationModal = ({ amount, customerIds, onConfirm, onClose }) => {
        const customerNames = customers
            .filter(c => customerIds.includes(c.id))
            .map(c => c.name);

        return (
            <ModalBase title="Confirm Monthly Deduction" onClose={onClose}>
                <div className="bg-red-800/20 text-red-300 p-4 rounded-lg flex items-start space-x-3 mb-6 border border-red-700">
                    <AlertTriangle size={20} className="mt-1 flex-shrink-0" />
                    <p className="text-sm">
                        This action is **IRREVERSIBLE**. It will record a **Cash Out** transaction and adjust the balance for all selected accounts.
                    </p>
                </div>

                <div className="space-y-4 text-gray-300">
                    <p>You are about to deduct the following amount:</p>
                    <h4 className="text-3xl font-extrabold text-white">GHS {amount.toFixed(2)}</h4>
                    <p>From **{customerIds.length}** customer(s):</p>
                    <div className="h-24 overflow-y-auto bg-[#0e1625] p-3 rounded-lg border border-gray-700">
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                            {customerNames.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                        Confirm Deduction
                    </button>
                </div>
            </ModalBase>
        );
    };

    const NewLoanModal = ({ customers, onSubmit, onClose }) => {
        const [customerId, setCustomerId] = useState('');
        const [principal, setPrincipal] = useState('');
        const [termMonths, setTermMonths] = useState('12');
        const [interestRate, setInterestRate] = useState('15');
        const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10)); // YYYY-MM-DD

        useEffect(() => {
            // Set first customer as default selection
            if (customers.length > 0 && !customerId) {
                setCustomerId(customers[0].id);
            }
        }, [customers, customerId]);

        const handleSubmit = (e) => {
            e.preventDefault();
            const principalNum = parseFloat(principal);
            const termNum = parseInt(termMonths, 10);
            
            if (!customerId || principalNum <= 0 || termNum <= 0 || isNaN(principalNum) || isNaN(termNum)) {
                displayMessage('Please select a customer and enter valid principal and term.', true);
                return;
            }

            onSubmit({
                customerId,
                principal: principalNum,
                termMonths: termNum,
                interestRate: parseFloat(interestRate),
                startDate: new Date(startDate),
            });
        };

        return (
            <ModalBase title="Record New Loan Disbursement" onClose={onClose}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Customer</label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                            required
                            disabled={customers.length === 0}
                        >
                            {customers.length === 0 ? (
                                <option value="">No Customers Available</option>
                            ) : (
                                customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (GHS{c.balance?.toFixed(2)})</option>
                                ))
                            )}
                        </select>
                    </div>
                    
                    <input
                        type="number"
                        placeholder="Principal Amount (GHS)"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                        className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                        step="0.01"
                        min="0.01"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Term (Months)</label>
                            <input
                                type="number"
                                placeholder="Term (Months)"
                                value={termMonths}
                                onChange={(e) => setTermMonths(e.target.value)}
                                className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1">Interest Rate (%)</label>
                            <input
                                type="number"
                                placeholder="Interest Rate (%)"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                                step="0.1"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Disbursement Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                            required
                        />
                    </div>
                    
                    <p className="text-sm text-gray-500 pt-2">
                        Recording this will establish a new loan liability for the customer.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                        >
                            Disburse Loan
                        </button>
                    </div>
                </form>
            </ModalBase>
        );
    };

    // Loan Repayment Modal
    const LoanRepaymentModal = ({ loan, onSubmit, onClose }) => {
        const [amount, setAmount] = useState(loan.outstandingBalance.toFixed(2));
        const [description, setDescription] = useState('');
        
        const maxRepayable = loan.outstandingBalance;

        const handleSubmit = (e) => {
            e.preventDefault();
            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                displayMessage('Please enter a valid positive amount (GHS).', true);
                return;
            }
            if (numericAmount > maxRepayable) {
                displayMessage(`Repayment amount cannot exceed outstanding balance of GHS${maxRepayable.toFixed(2)}.`, true);
                return;
            }
    
            onSubmit(loan.id, numericAmount, description);
        };
    
        return (
            <ModalBase title={`Record Repayment for ${loan.customerName}`} onClose={onClose}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-gray-400">
                        Outstanding Balance: <span className="font-bold text-lg text-red-400">GHS{loan.outstandingBalance.toFixed(2)}</span>
                    </p>
                    
                    <input
                        type="number"
                        placeholder={`Amount to repay (Max: ${maxRepayable.toFixed(2)})`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                        step="0.01"
                        min="0.01"
                        max={maxRepayable}
                        required
                    />
                    <textarea
                        placeholder="Repayment details (e.g., Monthly installment, Final settlement)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400 h-20"
                    />
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold">
                            Record Repayment
                        </button>
                    </div>
                </form>
            </ModalBase>
        );
    };


    // --- VIEW RENDERERS ---
    
    // 1. Dashboard View
    const DashboardView = () => (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> 
                <StatCard 
                    title="Total Savings Balance" 
                    value={dashboardTotals.totalSavingsBalance} 
                    colorClass={dashboardTotals.totalSavingsBalance >= 0 ? 'text-green-400' : 'text-red-400'}
                />
                 <StatCard 
                    title="Total Loan Principal" 
                    value={dashboardTotals.totalLoanPrincipal} 
                    colorClass="text-yellow-500"
                />
                <StatCard 
                    title="Outstanding Loan Debt" 
                    value={dashboardTotals.totalOutstandingLoan} 
                    colorClass="text-red-400"
                />
                <StatCard 
                    title="Customer Count" 
                    value={dashboardTotals.customerCount} 
                    colorClass="text-indigo-400"
                />
            </div>
        </div>
    );

    // 2. Cash Book View 
    const CashBookView = () => {
        // UPDATED: Search only by name and accountNo
        const filteredCustomers = customers.filter(customer => 
            customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.accountNo?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div>
                <h2 className="text-3xl font-bold text-white mb-6">Cash Book (Customer Accounts)</h2>
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="relative w-full sm:w-80 flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            // UPDATED: Placeholder
                            placeholder="Search by name or account number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 pl-10 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                        />
                    </div>
                    <button 
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-lg"
                        onClick={() => setIsCustomerModalOpen(true)}
                    >
                        <Plus size={20} />
                        <span>Add New Customer</span>
                    </button>
                </div>

                <div className="bg-[#1a2333] rounded-xl overflow-x-auto shadow-lg">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-[#0e1625] text-left text-gray-400 uppercase text-sm">
                                <th className="w-1/3 p-4 font-semibold">Name</th>
                                {/* REMOVED: Phone and Business columns */}
                                <th className="w-1/3 p-4 font-semibold">Account No.</th>
                                <th className="w-1/3 p-4 font-semibold text-right">Balance (GHS)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan="3" className="p-4 text-center text-gray-500">Loading customers...</td></tr>
                            )}
                            {!loading && filteredCustomers.length === 0 && (
                                <tr><td colSpan="3" className="p-4 text-center text-gray-500">No results found.</td></tr>
                            )}
                            {filteredCustomers.map((customer) => (
                                <tr 
                                    key={customer.id} 
                                    className="border-t border-gray-700 hover:bg-[#2a3447] text-white cursor-pointer"
                                    onClick={() => handleSelectCustomer(customer)}
                                >
                                    <td className="p-4 font-medium">{customer.name}</td>
                                    {/* REMOVED: Phone and Business cells */}
                                    <td className="p-4">{customer.accountNo || 'N/A'}</td>
                                    <td className={`p-4 font-bold text-right ${customer.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {customer.balance ? customer.balance.toFixed(2) : '0.00'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // 3. Customer Detail View 
    const CustomerDetailView = ({ customer, transactions, onAddTransaction, onBack }) => {
        // Find active loans for this customer
        const customerLoans = loans.filter(l => l.customerId === customer.id && l.status === 'Active');

        // Calculations
        const totalCashIn = transactions
            .filter(t => t.type === 'cash_in')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalCashOut = transactions
            .filter(t => t.type === 'cash_out')
            .reduce((sum, t) => sum + t.amount, 0);

        // Determine colors
        const balanceColor = customer.balance >= 0 ? 'text-green-400' : 'text-red-400';

        return (
            <div>
                <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4 flex-wrap gap-4">
                    <h2 className="text-3xl font-bold text-white flex items-center">
                        <button onClick={onBack} className="text-gray-400 hover:text-white mr-3 p-2 rounded-full hover:bg-[#2a3447] transition">
                            <ArrowLeft size={24} />
                        </button>
                        {customer.name} Account <span className="text-base font-normal text-gray-500 ml-4">(Acct No: {customer.accountNo || 'N/A'})</span>
                    </h2>
                    
                    {/* Cash In / Cash Out Buttons */}
                    <div className="flex space-x-3">
                        <button
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
                            onClick={() => onAddTransaction('cash_in')}
                        >
                            <TrendingUp size={20} />
                            <span>Cash In</span>
                        </button>
                        <button
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
                            onClick={() => onAddTransaction('cash_out')}
                        >
                            <TrendingDown size={20} />
                            <span>Cash Out</span>
                        </button>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="flex overflow-x-auto gap-4 mb-8 pb-2">
                    {/* Net Balance Card */}
                    <StatCard 
                        title="Net Balance (Savings)" 
                        value={customer.balance} 
                        colorClass={balanceColor} 
                    />
                    {/* Total Cash In Card */}
                    <StatCard 
                        title="Total Cash In (GHS)" 
                        value={totalCashIn} 
                        colorClass="text-green-400" 
                    />
                    {/* Total Cash Out Card */}
                    <StatCard 
                        title="Total Cash Out (GHS)" 
                        value={totalCashOut} 
                        colorClass="text-red-400" 
                    />
                    <StatCard 
                        title="Active Loans Count" 
                        value={customerLoans.length} 
                        colorClass="text-yellow-500" 
                    />
                </div>
                
                {/* Loan Status Box (Updated to include Repay button) */}
                {customerLoans.length > 0 && (
                    <div className="bg-yellow-900/30 p-4 rounded-xl mb-8 border border-yellow-700">
                        <h3 className="text-xl font-semibold text-yellow-300 mb-2 flex items-center space-x-2">
                            <PiggyBank size={20}/>
                            <span>Active Loans ({customerLoans.length})</span>
                        </h3>
                        <div className="space-y-3">
                            {customerLoans.map(loan => (
                                <div key={loan.id} className="flex justify-between items-center py-1 border-b border-yellow-800/50 last:border-b-0">
                                    <p className="text-sm text-yellow-100 flex-1">
                                        Loan ID: {loan.id.substring(0, 8)}... | Outstanding: **GHS{loan.outstandingBalance.toFixed(2)}** | Monthly Est: GHS{loan.monthlyPaymentEstimate}
                                    </p>
                                    <button
                                        className="text-xs px-3 py-1 bg-yellow-600 rounded-md hover:bg-yellow-700 transition font-medium ml-4"
                                        onClick={() => {
                                            const fullLoan = loans.find(l => l.id === loan.id);
                                            setSelectedLoanForRepayment({ ...fullLoan, customerName: customer.name });
                                            setIsRepaymentModalOpen(true);
                                        }}
                                        disabled={loan.outstandingBalance <= 0}
                                    >
                                        Repay
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Transaction History Table */}
                <h3 className="text-2xl font-semibold text-white mb-4">Recent Entries & History</h3>
                <div className="bg-[#1a2333] rounded-xl overflow-x-auto shadow-lg">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-[#0e1625] text-left text-gray-400 uppercase text-sm">
                                <th className="w-1/6 p-4 font-semibold">Date & Time</th>
                                <th className="w-1/6 p-4 font-semibold">Type</th>
                                <th className="w-1/6 p-4 font-semibold text-right">Amount (GHS)</th>
                                <th className="w-1/2 p-4 font-semibold">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">No transactions recorded yet.</td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="border-t border-gray-700 hover:bg-[#2a3447] text-white">
                                        <td className="p-4 text-sm">{new Date(t.date.toDate()).toLocaleString()}</td>
                                        <td className={`p-4 font-medium ${t.type === 'cash_in' ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.type === 'cash_in' ? 'Cash In' : 'Cash Out'}
                                        </td>
                                        <td className={`p-4 font-bold text-right`}>
                                            {t.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-sm truncate max-w-xs">{t.description || 'N/A'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // 4. Monthly Deduction View 
    const MonthlyDeductionView = () => (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Monthly Deduction Processing</h2>
            <div className="bg-[#1a2333] p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-medium text-gray-300 mb-4">Set Deduction Amount (GHS)</h3>
                <div className="relative mb-4">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">GHS</span>
                    <input
                        type="number"
                        placeholder="Enter amount to deduct (e.g., 50.00)"
                        value={deductionAmount}
                        onChange={(e) => setDeductionAmount(e.target.value)}
                        className="w-full p-3 pl-12 bg-[#0e1625] text-white border border-gray-700 rounded-lg focus:ring-green-400 focus:border-green-400"
                        step="0.01"
                    />
                </div>
                
                <p className="text-sm text-gray-400 mb-6">
                    Enter the amount, select the customers below, and click 'Process Deductions'. 
                    This will record a **Cash Out** transaction and update each selected customer's balance.
                </p>
                
                <div className="flex justify-end">
                    <button 
                        onClick={handleProcessDeduction}
                        disabled={selectedDeductionIds.length === 0 || !deductionAmount || parseFloat(deductionAmount) <= 0}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Process {selectedDeductionIds.length} Selected Deductions
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-300">Customers ({selectedDeductionIds.length} selected)</h4>
                        <label className="flex items-center space-x-2 text-gray-400">
                            <input 
                                type="checkbox" 
                                className="form-checkbox text-green-600 rounded" 
                                checked={selectedDeductionIds.length === customers.length && customers.length > 0}
                                onChange={() => {
                                    if (selectedDeductionIds.length === customers.length) {
                                        setSelectedDeductionIds([]);
                                    } else {
                                        setSelectedDeductionIds(customers.map(c => c.id));
                                    }
                                }}
                            />
                            <span>Select All</span>
                        </label>
                    </div>
                    {/* Customer List Table */}
                    <div className="bg-[#0e1625] rounded-lg overflow-x-auto max-h-80">
                        <table className="min-w-full">
                            <thead>
                                <tr className="sticky top-0 bg-[#1a2333] text-left text-gray-400 uppercase text-xs">
                                    <th className="w-1/12 p-3">Select</th>
                                    <th className="w-5/12 p-3 font-semibold">Customer Name</th>
                                    <th className="w-3/12 p-3 font-semibold text-right">Current Balance (GHS)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.length === 0 ? (
                                    <tr><td colSpan="3" className="p-4 text-center text-gray-500">No customers available for deduction.</td></tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="border-t border-gray-700 text-white hover:bg-[#2a3447]">
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDeductionIds.includes(customer.id)}
                                                    onChange={() => toggleCustomerSelection(customer.id)}
                                                    className="form-checkbox h-4 w-4 text-green-600 rounded bg-gray-700 border-gray-600 focus:ring-green-500"
                                                />
                                            </td>
                                            <td className="p-3 font-medium">{customer.name}</td>
                                            <td className={`p-3 font-bold text-right ${customer.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {customer.balance ? customer.balance.toFixed(2) : '0.00'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // 5. Loan Management View 
    const LoanManagementView = () => {
        // Prepare data: merge loan details with customer name
        const loanData = loans.map(loan => {
            const customer = customers.find(c => c.id === loan.customerId);
            return {
                ...loan,
                customerName: customer ? customer.name : 'Unknown Customer',
            };
        });

        const activeLoans = loanData.filter(loan => loan.status === 'Active');

        return (
            <div>
                <h2 className="text-3xl font-bold text-white mb-6">Loan Management</h2>
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <StatCard 
                        title="Active Loans" 
                        value={activeLoans.length} 
                        colorClass="text-yellow-500"
                    />
                    <StatCard 
                        title="Total Outstanding Debt" 
                        value={dashboardTotals.totalOutstandingLoan} 
                        colorClass="text-red-400"
                    />
                    <button 
                        className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold shadow-lg"
                        onClick={() => setIsLoanModalOpen(true)}
                    >
                        <Plus size={20} />
                        <span>New Loan</span>
                    </button>
                </div>

                <div className="bg-[#1a2333] rounded-xl overflow-x-auto shadow-lg mt-4">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-[#0e1625] text-left text-gray-400 uppercase text-sm">
                                <th className="w-1/5 p-4 font-semibold">Customer</th>
                                <th className="w-1/6 p-4 font-semibold text-right">Principal (GHS)</th>
                                <th className="w-1/6 p-4 font-semibold text-right">Outstanding (GHS)</th>
                                <th className="w-1/12 p-4 font-semibold">Rate (%)</th>
                                <th className="w-1/12 p-4 font-semibold">Term (M)</th>
                                <th className="w-1/6 p-4 font-semibold">Start Date</th>
                                <th className="w-1/12 p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loanData.length === 0 ? (
                                <tr><td colSpan="7" className="p-4 text-center text-gray-500">No loans found.</td></tr>
                            ) : (
                                loanData.map((loan) => (
                                    <tr 
                                        key={loan.id} 
                                        className="border-t border-gray-700 hover:bg-[#2a3447] text-white cursor-pointer"
                                        onClick={() => handleSelectCustomer(customers.find(c => c.id === loan.customerId))}
                                    >
                                        <td className="p-4 font-medium">{loan.customerName}</td>
                                        <td className="p-4 text-right">{loan.principal.toFixed(2)}</td>
                                        <td className={`p-4 font-bold text-right ${loan.outstandingBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {loan.outstandingBalance.toFixed(2)}
                                        </td>
                                        <td className="p-4">{loan.interestRate.toFixed(1)}%</td>
                                        <td className="p-4">{loan.termMonths}</td>
                                        <td className="p-4 text-sm">{loan.startDate.toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                loan.status === 'Active' ? 'bg-yellow-800 text-yellow-100' : 'bg-green-800 text-green-100'
                                            }`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // 6. App Settings View (unchanged)
    const AppSettingsView = () => (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">App Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Account Management (OTP Mock) */}
                <div className="bg-[#1a2333] p-6 rounded-xl shadow-lg col-span-1 lg:col-span-2">
                    <div className="flex items-center space-x-3 mb-4 text-gray-200">
                        <User size={20} className="text-pink-400" />
                        <h3 className="text-xl font-semibold">User Account Management (OTP Mock)</h3>
                    </div>
                    <div className="space-y-4">
                        <p className="text-gray-400 mb-2">
                            The current environment uses **secure token-based authentication** for persistence. Below is the full **User Registration Process** architectural plan, as requested, including OTP verification.
                        </p>
                        <div className="bg-[#0e1625] p-4 rounded-lg text-sm space-y-2 border border-pink-700">
                            <p className="text-white font-medium flex items-center"><span className="text-pink-400 mr-2">1.</span> **Registration:** User provides Name & Email/Phone.</p>
                            <p className="text-white font-medium flex items-center"><span className="text-pink-400 mr-2">2.</span> **Send OTP:** Backend sends a unique OTP (4-6 digits) via Email Service or SMS API (e.g., Twilio).</p>
                            <p className="text-white font-medium flex items-center"><span className="text-pink-400 mr-2">3.</span> **Verify OTP:** User inputs OTP; if valid and non-expired, account is marked as **verified**.</p>
                            <p className="text-white font-medium flex items-center"><span className="text-pink-400 mr-2">4.</span> **Set Password:** User creates a secure password, which is hashed and stored.</p>
                            <p className="text-gray-500 text-xs mt-3">
                                *Note: OTP sending/verification requires external server APIs (like Twilio/SendGrid). This app uses the current Firebase environment for core data storage and user persistence.*
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* System Configuration */}
                <div className="bg-[#1a2333] p-6 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-3 mb-4 text-gray-200">
                        <Zap size={20} className="text-yellow-400" />
                        <h3 className="text-xl font-semibold">System Configuration</h3>
                    </div>
                    <div className="space-y-4">
                        <SettingItem label="Default Currency" value="GHS (Ghana Cedi)" />
                        <SettingItem label="Application Version" value="1.0.1 (SSCU Enhanced)" />
                        <SettingToggle label="Enable Two-Factor Auth" checked={true} />
                    </div>
                </div>

                {/* Deduction Management */}
                <div className="bg-[#1a2333] p-6 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-3 mb-4 text-gray-200">
                        <Clock size={20} className="text-blue-400" />
                        <h3 className="text-xl font-semibold">Deduction Management</h3>
                    </div>
                    <div className="space-y-4">
                        <SettingItem label="Monthly Deduction Day" value="1st of the Month" />
                        <SettingItem label="Late Fee Percentage" value="5.0%" />
                        <SettingToggle label="Require Admin Approval for Deductions" checked={true} />
                    </div>
                </div>
            </div>
        </div>
    );

    const SettingItem = ({ label, value }) => (
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-medium">{value}</span>
        </div>
    );

    const SettingToggle = ({ label, checked }) => (
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="text-gray-400">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={checked} readOnly className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
        </div>
    );


    // Main View Selector
    const renderView = () => {
        if (selectedCustomer && currentView === 'Customer Detail') {
            // Note: onAddTransaction now takes a type argument (cash_in or cash_out)
            return (
                <CustomerDetailView 
                    customer={selectedCustomer} 
                    transactions={transactions} 
                    onAddTransaction={(type) => {
                        setIsTransactionDrawerOpen(true);
                    }}
                    onBack={handleBackToCashBook}
                />
            );
        }

        switch (currentView) {
            case 'Dashboard':
                return <DashboardView />;
            case 'Cash Book':
                return <CashBookView />;
            case 'Monthly Deduction':
                return <MonthlyDeductionView />;
            case 'Loan Management': // NEW VIEW
                return <LoanManagementView />;
            case 'App Settings':
                return <AppSettingsView />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0e1625] text-white p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center py-4 px-6 bg-[#1a2333] rounded-xl shadow-2xl mb-6">
                    <h1 className="text-2xl font-bold text-green-400">SSCU Manager (GHS)</h1>
                    <div className="flex items-center space-x-4">
                        <p className="text-xs text-gray-400 hidden sm:block">
                            User ID: <span className="font-mono text-green-400">{userId || 'Connecting...'}</span>
                        </p>
                        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm">
                            Log Out
                        </button>
                    </div>
                </header>
                
                {/* Navigation and Main Content */}
                <div className="bg-[#1a2333] p-6 rounded-xl shadow-2xl">
                    {/* Navigation Tabs */}
                    <div className="flex space-x-2 border-b border-gray-700 pb-2 mb-8 overflow-x-auto">
                        {navItems.map(item => (
                            <NavTab key={item.name} name={item.name} icon={item.icon} />
                        ))}
                    </div>

                    {/* Message/Error Display */}
                    {error && (
                        <div className="p-4 bg-red-800 text-white rounded-lg mb-6 border border-red-500 transition duration-300">
                            <strong>System Message:</strong> {error}
                        </div>
                    )}

                    {/* Main View */}
                    {renderView()}
                </div>
            </div>

            {/* Modals & Drawer */}
            {isCustomerModalOpen && <NewCustomerModal 
                onSubmit={handleAddCustomer} 
                onClose={() => setIsCustomerModalOpen(false)} 
            />}
            {/* NEW DRAWER */}
            {isTransactionDrawerOpen && selectedCustomer && <TransactionDrawer 
                customer={selectedCustomer}
                onSubmit={handleAddTransaction}
                onClose={() => setIsTransactionDrawerOpen(false)}
            />}
            {isDeductionConfirmationOpen && <DeductionConfirmationModal 
                amount={deductionPendingData.amount}
                customerIds={deductionPendingData.customerIds}
                onConfirm={confirmDeduction}
                onClose={() => setIsDeductionConfirmationOpen(false)}
            />}
            {isLoanModalOpen && <NewLoanModal 
                customers={customers}
                onSubmit={handleAddLoan}
                onClose={() => setIsLoanModalOpen(false)}
            />}
            {isRepaymentModalOpen && selectedLoanForRepayment && <LoanRepaymentModal
                loan={selectedLoanForRepayment}
                onSubmit={handleRepayLoan}
                onClose={() => {
                    setIsRepaymentModalOpen(false);
                    setSelectedLoanForRepayment(null);
                }}
            />}
        </div>
    );
};

export default App;
