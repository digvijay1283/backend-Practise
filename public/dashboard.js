// Check authentication on page load
checkAuth();

async function checkAuth() {
    try {
        const response = await fetch('/check-auth');
        const result = await response.json();
        
        if (!result.authenticated) {
            window.location.href = '/index.html';
            return;
        }
        
        document.getElementById('usernameDisplay').innerText = result.username;
        loadItems();
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/index.html';
    }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/logout', { method: 'POST' });
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Error logging out. Please try again.');
    }
});

// Item form handler
const itemForm = document.getElementById('itemForm');
const itemIdInput = document.getElementById('itemId');
const itemTitleInput = document.getElementById('itemTitle');
const itemDescriptionInput = document.getElementById('itemDescription');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const itemId = itemIdInput.value;
    const title = itemTitleInput.value;
    const description = itemDescriptionInput.value;
    
    if (itemId) {
        // Update existing item
        await updateItem(itemId, title, description);
    } else {
        // Create new item
        await createItem(title, description);
    }
});

cancelBtn.addEventListener('click', () => {
    resetForm();
});

// Create item
async function createItem(title, description) {
    try {
        const response = await fetch('/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            resetForm();
            loadItems();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error creating item:', error);
        alert('Error creating item. Please try again.');
    }
}

// Load all items
async function loadItems() {
    try {
        const response = await fetch('/items');
        const result = await response.json();
        
        if (response.ok) {
            displayItems(result.items);
        } else {
            console.error('Error loading items:', result.message);
        }
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

// Display items
function displayItems(items) {
    const itemsList = document.getElementById('itemsList');
    
    if (items.length === 0) {
        itemsList.innerHTML = '<p class="no-items">No items found. Create your first item!</p>';
        return;
    }
    
    itemsList.innerHTML = items.map(item => `
        <div class="item-card" data-id="${item._id}">
            <div class="item-header">
                <h3>${escapeHtml(item.title)}</h3>
                <div class="item-actions">
                    <button class="btn btn-edit" onclick="editItem('${item._id}')">Edit</button>
                    <button class="btn btn-delete" onclick="deleteItem('${item._id}')">Delete</button>
                </div>
            </div>
            <div class="item-body">
                <p>${escapeHtml(item.description || 'No description')}</p>
            </div>
            <div class="item-footer">
                <small>Created: ${new Date(item.createdAt).toLocaleString()}</small>
                ${item.updatedAt && item.updatedAt !== item.createdAt ? 
                    `<small>Updated: ${new Date(item.updatedAt).toLocaleString()}</small>` : ''}
            </div>
        </div>
    `).join('');
}

// Edit item
async function editItem(itemId) {
    try {
        const response = await fetch(`/items/${itemId}`);
        const result = await response.json();
        
        if (response.ok) {
            const item = result.item;
            itemIdInput.value = item._id;
            itemTitleInput.value = item.title;
            itemDescriptionInput.value = item.description || '';
            formTitle.innerText = 'Edit Item';
            submitBtn.innerText = 'Update Item';
            cancelBtn.style.display = 'inline-block';
            
            // Scroll to form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error fetching item:', error);
        alert('Error loading item. Please try again.');
    }
}

// Update item
async function updateItem(itemId, title, description) {
    try {
        const response = await fetch(`/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            resetForm();
            loadItems();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error updating item:', error);
        alert('Error updating item. Please try again.');
    }
}

// Delete item
async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetch(`/items/${itemId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            loadItems();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
    }
}

// Reset form
function resetForm() {
    itemForm.reset();
    itemIdInput.value = '';
    formTitle.innerText = 'Create New Item';
    submitBtn.innerText = 'Create Item';
    cancelBtn.style.display = 'none';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
