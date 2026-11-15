
/* ========================================
   VERITY APPLICATION
======================================== */


/* ========================================
   1. GET HTML ELEMENTS
======================================== */

// Views
const workspaceView = document.getElementById("workspaceView");
const editorView = document.getElementById("editorView");
const reportView = document.getElementById("reportView");
const historyView = document.getElementById("historyView");

// Navigation
const workspaceNav = document.getElementById("workspaceNav");
const historyNav = document.getElementById("historyNav");
const brand = document.querySelector(".brand");

// Workspace
const newDocumentButton = document.getElementById("newDocumentButton");
const documentList = document.getElementById("documentList");

// Editor
const documentForm = document.getElementById("documentForm");
const documentTitle = document.getElementById("documentTitle");
const documentContent = document.getElementById("documentContent");
const wordCount = document.getElementById("wordCount");
const saveDraftButton = document.getElementById("saveDraftButton");
const backButton = document.getElementById("backButton");

// Report
const reportContentTitle = document.getElementById("reportContentTitle");
const editContentButton = document.getElementById("editContentButton");
const finishReviewButton = document.getElementById("finishReviewButton");

// Report findings
const repetitionFindings = document.getElementById("repetitionFindings");
const structureFindings = document.getElementById("structureFindings");
const claimFindings = document.getElementById("claimFindings");

// History
const historyList = document.getElementById("historyList");

// Summary
const documentCount = document.getElementById("documentCount");
const draftCount = document.getElementById("draftCount");
const reviewedCount = document.getElementById("reviewedCount");

// Delete modal
const deleteModal = document.getElementById("deleteModal");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");


/* ========================================
   2. APPLICATION DATA
======================================== */

let documents = [];

let currentDocumentId = null;

let documentToDeleteId = null;


// LOAD SAVED DOCUMENTS

function loadDocuments() {

    const savedDocuments = localStorage.getItem("verityDocuments");

    if (savedDocuments === null) {

        documents = [];

        return;

    }

    try {

        documents = JSON.parse(savedDocuments);

        if (!Array.isArray(documents)) {

            documents = [];

        }

    } catch (error) {

        console.error("Could not load saved documents:", error);

        documents = [];

    }

}


// SAVE DOCUMENTS

function saveDocuments() {

    try {

        localStorage.setItem(
            "verityDocuments",
            JSON.stringify(documents)
        );

    } catch (error) {

        console.error("Could not save documents:", error);

        alert("Your content could not be saved. Please check your browser storage.");

    }

}


/* ========================================
   3. VIEW MANAGEMENT
======================================== */

function hideAllViews() {

    workspaceView.classList.add("hidden");
    editorView.classList.add("hidden");
    reportView.classList.add("hidden");
    historyView.classList.add("hidden");

}


function showWorkspace() {

    hideAllViews();

    workspaceView.classList.remove("hidden");

    updateNavigation("workspace");

}


function showEditor() {

    hideAllViews();

    editorView.classList.remove("hidden");

    updateNavigation("workspace");

}


function showReport() {

    hideAllViews();

    reportView.classList.remove("hidden");

    updateNavigation("workspace");

}


function showHistory() {

    hideAllViews();

    historyView.classList.remove("hidden");

    updateNavigation("history");

}


/* ========================================
   4. NAVIGATION
======================================== */

function updateNavigation(activePage) {

    workspaceNav.classList.remove("active");
    historyNav.classList.remove("active");

    if (activePage === "workspace") {

        workspaceNav.classList.add("active");

    }

    if (activePage === "history") {

        historyNav.classList.add("active");

    }

}


/* ========================================
   5. FORM MANAGEMENT
======================================== */

function resetForm() {

    documentForm.reset();

    currentDocumentId = null;

    updateWordCount();

}


function updateWordCount() {

    const content = documentContent.value.trim();

    const count = content === ""
        ? 0
        : content.split(/\s+/).length;

    wordCount.textContent = count + " words";

}


function countWords(text) {

    const content = text.trim();

    return content === ""
        ? 0
        : content.split(/\s+/).length;

}


/* ========================================
   6. DISPLAY DOCUMENTS
======================================== */

function displayDocuments() {

    documentList.innerHTML = "";

    if (documents.length === 0) {

        documentList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✳</div>
                <h3>Your workspace is ready</h3>

                <p>
                    Create your first piece of content to get started.
                </p>

                <button class="text-button" id="emptyStateButton">
                    Create content →
                </button>
            </div>
        `;

        updateSummary();

        return;

    }

    documents.forEach(function(savedDocument) {

        const documentItem = createDocumentItem(savedDocument);

        documentList.appendChild(documentItem);

    });

    updateSummary();

}


/* ========================================
   7. DISPLAY HISTORY
======================================== */

function displayHistory() {

    historyList.innerHTML = "";

    const reviewedHistory = documents.filter(function(document) {

        return document.status === "reviewed";

    });

    if (reviewedHistory.length === 0) {

        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">↻</div>

                <h3>No history yet</h3>

                <p>
                    Documents you finish reviewing will appear here.
                </p>
            </div>
        `;

        return;

    }

    reviewedHistory.forEach(function(savedDocument) {

        const historyItem = createDocumentItem(savedDocument);

        historyList.appendChild(historyItem);

    });

}


/* ========================================
   8. CREATE DOCUMENT ITEM
======================================== */

function createDocumentItem(savedDocument) {

    const documentItem = document.createElement("div");

    documentItem.className = "document-item";

    const documentDetails = document.createElement("div");

    documentDetails.innerHTML = `
        <h3>${escapeHTML(savedDocument.title)}</h3>

        <span class="document-meta">
            ${countWords(savedDocument.content)} words
        </span>
    `;

    const status = document.createElement("span");

    status.className = "document-status";

    status.textContent = savedDocument.status === "reviewed"
        ? "Reviewed"
        : "Draft";

    const actions = document.createElement("div");

    actions.className = "document-actions";


    // View Report button

    if (savedDocument.report) {

        const viewReportButton = document.createElement("button");

        viewReportButton.type = "button";

        viewReportButton.textContent = "View Report";

        viewReportButton.addEventListener("click", function(event) {

            event.stopPropagation();

            viewDocumentReport(savedDocument.id);

        });

        actions.appendChild(viewReportButton);

    }


    // Edit button

    const editButton = document.createElement("button");

    editButton.type = "button";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", function(event) {

        event.stopPropagation();

        openDocument(savedDocument.id);

    });

    actions.appendChild(editButton);


    // Delete button

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "delete-button";

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function(event) {

        event.stopPropagation();

        deleteDocument(savedDocument.id);

    });

    actions.appendChild(deleteButton);


    documentItem.appendChild(documentDetails);

    documentItem.appendChild(status);

    documentItem.appendChild(actions);


    // Open document when clicking its item

    documentItem.addEventListener("click", function() {

        openDocument(savedDocument.id);

    });

    return documentItem;

}


/* ========================================
   9. ESCAPE HTML
======================================== */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}


/* ========================================
   10. UPDATE SUMMARY
======================================== */

function updateSummary() {

    const total = documents.length;

    const drafts = documents.filter(function(document) {

        return document.status === "draft";

    }).length;

    const reviewed = documents.filter(function(document) {

        return document.status === "reviewed";

    }).length;

    documentCount.textContent = total;

    draftCount.textContent = drafts;

    reviewedCount.textContent = reviewed;

}


/* ========================================
   11. CREATE NEW DOCUMENT
======================================== */

function startNewDocument() {

    resetForm();

    showEditor();

}


/* ========================================
   12. OPEN DOCUMENT
======================================== */

function openDocument(documentId) {

    const selectedDocument = documents.find(function(document) {

        return document.id === documentId;

    });

    if (!selectedDocument) {

        return;

    }

    currentDocumentId = selectedDocument.id;

    documentTitle.value = selectedDocument.title;

    documentContent.value = selectedDocument.content;

    updateWordCount();

    showEditor();

}


/* ========================================
   13. SAVE DRAFT
======================================== */

function saveDraft() {

    const title = documentTitle.value.trim();

    const content = documentContent.value.trim();

    if (!title || !content) {

        alert("Please enter a title and content before saving.");

        return;

    }

    if (currentDocumentId !== null) {

        const selectedDocument = documents.find(function(document) {

            return document.id === currentDocumentId;

        });

        if (!selectedDocument) {

            return;

        }

        selectedDocument.title = title;

        selectedDocument.content = content;

        selectedDocument.report = null;

        selectedDocument.status = "draft";

        selectedDocument.updatedAt = new Date().toISOString();

    } else {

        const newDocument = {

            id: Date.now(),

            title: title,

            content: content,

            status: "draft",

            report: null,

            createdAt: new Date().toISOString(),

            updatedAt: new Date().toISOString()

        };

        documents.unshift(newDocument);

        currentDocumentId = newDocument.id;

    }

    saveDocuments();

    displayDocuments();

    displayHistory();

    showWorkspace();

    alert("Draft saved successfully.");
}


/* ========================================
   14. ANALYZE CONTENT
======================================== */

function analyzeContent() {

    const title = documentTitle.value.trim();

    const content = documentContent.value.trim();

    if (!title || !content) {

        alert("Please enter a title and content before analyzing.");

        return;

    }

    let selectedDocument;

    if (currentDocumentId !== null) {

        selectedDocument = documents.find(function(document) {

            return document.id === currentDocumentId;

        });

    }

    if (!selectedDocument) {

        selectedDocument = {

            id: Date.now(),

            title: title,

            content: content,

            status: "draft",

            report: null,

            createdAt: new Date().toISOString(),

            updatedAt: new Date().toISOString()

        };

        documents.unshift(selectedDocument);

        currentDocumentId = selectedDocument.id;

    } else {

        selectedDocument.title = title;

        selectedDocument.content = content;

        selectedDocument.status = "draft";

        selectedDocument.updatedAt = new Date().toISOString();

    }

    selectedDocument.report = {

        title: title,

        originalText: content,

        analyzedAt: new Date().toISOString()

    };

    reportContentTitle.textContent = title;

    saveDocuments();

    displayDocuments();

    displayHistory();

    viewDocumentReport(selectedDocument.id);

}


/* ========================================
   15. VIEW DOCUMENT REPORT
======================================== */

function viewDocumentReport(documentId) {

    const selectedDocument = documents.find(function(document) {

        return document.id === documentId;

    });

    if (!selectedDocument || !selectedDocument.report) {

        return;

    }

    currentDocumentId = selectedDocument.id;

    reportContentTitle.textContent = selectedDocument.title;

    showReport();

}


/* ========================================
   16. EDIT CONTENT
======================================== */

function editContent() {

    if (currentDocumentId === null) {

        return;

    }

    openDocument(currentDocumentId);

}


/* ========================================
   17. DELETE MODAL
======================================== */

// Open modal

function deleteDocument(documentId) {

    documentToDeleteId = documentId;

    deleteModal.classList.remove("hidden");

}


// Close modal

function closeDeleteModal() {

    deleteModal.classList.add("hidden");

    documentToDeleteId = null;

}


// Confirm deletion

function confirmDelete() {

    if (documentToDeleteId === null) {

        return;

    }

    const selectedId = documentToDeleteId;

    documents = documents.filter(function(document) {

        return document.id !== selectedId;

    });

    if (currentDocumentId === selectedId) {

        currentDocumentId = null;

    }

    closeDeleteModal();

    saveDocuments();

    displayDocuments();

    displayHistory();

}


/* ========================================
   18. FINISH REVIEW
======================================== */

function finishReview() {

    if (currentDocumentId === null) {

        return;

    }

    const selectedDocument = documents.find(function(document) {

        return document.id === currentDocumentId;

    });

    if (!selectedDocument) {

        return;

    }

    selectedDocument.status = "reviewed";

    saveDocuments();

    displayDocuments();

    displayHistory();

    showWorkspace();

}


/* ========================================
   19. EVENT LISTENERS
======================================== */

// Navigation

workspaceNav.addEventListener("click", showWorkspace);

historyNav.addEventListener("click", function() {

    displayHistory();

    showHistory();

});

brand.addEventListener("click", function(event) {

    event.preventDefault();

    showWorkspace();

});


// New content button

newDocumentButton.addEventListener("click", startNewDocument);


// Create content button in empty state

documentList.addEventListener("click", function(event) {

    if (event.target.closest("#emptyStateButton")) {

        startNewDocument();

    }

});


// Editor

backButton.addEventListener("click", showWorkspace);

saveDraftButton.addEventListener("click", saveDraft);

documentContent.addEventListener("input", updateWordCount);

documentForm.addEventListener("submit", function(event) {

    event.preventDefault();

    analyzeContent();

});


// Report

editContentButton.addEventListener("click", editContent);

finishReviewButton.addEventListener("click", finishReview);


// Delete modal

cancelDeleteButton.addEventListener("click", closeDeleteModal);

confirmDeleteButton.addEventListener("click", confirmDelete);


// Close modal by clicking the background

deleteModal.addEventListener("click", function(event) {

    if (event.target === deleteModal) {

        closeDeleteModal();

    }

});


// Close modal using Escape

document.addEventListener("keydown", function(event) {

    if (
        event.key === "Escape" &&
        !deleteModal.classList.contains("hidden")
    ) {

        closeDeleteModal();

    }

});


/* ========================================
   20. INITIALIZE APPLICATION
======================================== */

// First, retrieve previously saved documents

loadDocuments();


// Then display the retrieved documents

displayDocuments();

displayHistory();

showWorkspace();

updateWordCount();