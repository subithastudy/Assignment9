const BASE_URL = `https://telephone-api-crud.vercel.app/`;

// Taking details from html form
const addNewContactForm = document.getElementById("contactForm");
const displayContactsEl = document.getElementById("contactList");
const searchInput = document.getElementById("search");

// Taking error details
const nameError = document.getElementById("nameError");
const phoneError = document.getElementById("phoneError");
const messageBox = document.getElementById("messageBox");

// Phone number validation regex
const phoneInput = addNewContactForm["phone"];
const phoneRegex = /^\+91\s[6-9]\d{9}$/;

// Initializing data
let editedId = null;
let allContacts = [];

// Validation messages display
const showMessage = (message, type = "success") => {
    messageBox.textContent = message;
    messageBox.className = "alert";

    if (type === "success") {
        messageBox.classList.add("alert-success");
    } else {
        messageBox.classList.add("alert-danger");
    }

    messageBox.classList.remove("d-none");

    setTimeout(() => {
        messageBox.classList.add("d-none");
    }, 3000);
};

// Auto prefix of phone number
phoneInput.addEventListener("focus", () => {
    if (!phoneInput.value.startsWith("+91 ")) {
        phoneInput.value = "+91 ";
    }
});

// Restrict input of phone number
phoneInput.addEventListener("input", () => {
    let value = phoneInput.value;

    if (!value.startsWith("+91 ")) {
        value = "+91 ";
    }

    let digits = value.slice(4).replace(/\D/g, "");
    digits = digits.slice(0, 10);

    phoneInput.value = "+91 " + digits;
});

// Prevent deleting +91
phoneInput.addEventListener("keydown", (e) => {
    if (phoneInput.selectionStart <= 4 && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault();
    }
});

// Fetch API
const fetchContacts = async() => {
    try {
        displayContactsEl.innerHTML = "Loading...";

        const response = await fetch(`${BASE_URL}api/phones`);

        if (!response.ok) {
            throw new Error(`API Error : ${response.status}`);
        }

        const data = await response.json();
        allContacts = data;

        displayContacts(allContacts);

    } catch (error) {
        console.log(error);
        showMessage("Failed to load contacts", "error");
    }
};

// Display contacts list
const displayContacts = (contacts) => {
    displayContactsEl.innerHTML = "";

    if (contacts.length === 0) {
        displayContactsEl.innerHTML = `
            <li  class="fw-bold">
                <p>No contact found</p>
                <button onclick="resetSearch()">
                    <i class="bi bi-x-lg"></i>
                </button>
            </li>
        `;
        return;
    }

    contacts.forEach((contact) => {
        const li = document.createElement("li");

        const phoneDisplay = contact.phoneNumber.startsWith("+91")
            ? contact.phoneNumber
            : "+91 " + contact.phoneNumber;

        li.innerHTML = `
      <strong>${contact.name}</strong> ${phoneDisplay}
      <div>
        <button onclick="editContact('${contact._id}','${contact.name}','${phoneDisplay}')" class="btn btn-secondary btn-sm rounded-pill me-2">Edit</button>
        <button onclick="deleteContact('${contact._id}')" class="btn btn-danger btn-sm rounded-pill">Delete</button>
      </div>
    `;

        displayContactsEl.appendChild(li);
    });
};

// Deleting contact
async function deleteContact(id) {
    const confirmDelete = confirm("Are you sure you want to delete this contact?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${BASE_URL}api/phones/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            throw new Error("Delete failed");
        }

        fetchContacts();
        showMessage("Contact deleted successfully", "success");

    } catch (error) {
        console.log(error);
        showMessage("Delete failed", "error");
    }
}

// Editing contact
function editContact(id, name, phone) {
    editedId = id;
    addNewContactForm["name"].value = name;
    addNewContactForm["phone"].value = phone;
}

// Searching contact
searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();

    if (!value) {
        displayContacts(allContacts);
        return;
    }

    const filtered = allContacts.filter((contact) => {
        return (
            contact.name.toLowerCase().includes(value) ||
            contact.phoneNumber.includes(value)
        );
    });

    displayContacts(filtered);
});

// Reseting value after invalid search
function resetSearch() {
    searchInput.value = "";
    displayContacts(allContacts);
}

// Add or update contact
const handleAddNewContact = async () => {
    try {
        const name = addNewContactForm["name"].value.trim();
        const phone = addNewContactForm["phone"].value.trim();

        let isValid = true;

        // Clear errors
        nameError.textContent = "";
        phoneError.textContent = "";

        // Name validation
        if (name === "") {
            nameError.textContent = "Name is required";
            isValid = false;
        }

        // Mobile number validation
        if (phone === "") {
            phoneError.textContent = "Phone number is required";
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            phoneError.textContent = "Phone number must contain 10 digits";
            isValid = false;
        }

        if (!isValid) return;

        const user = {
            name: name,
            phoneNumber: phone,
        };

        if (editedId) {
            const res = await fetch(`${BASE_URL}api/phones/${editedId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });

            if (!res.ok) throw new Error("Update failed");

            showMessage("Contact updated successfully", "success");
            editedId = null;

        } else {
            const res = await fetch(`${BASE_URL}api/phones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });

            if (!res.ok) throw new Error("Create failed");

            showMessage("Contact added successfully", "success");
        }

        addNewContactForm.reset();
        fetchContacts();

    } catch (error) {
        console.log(error);
        showMessage("Operation failed", "error");
    }
};

// Submit button
addNewContactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAddNewContact();
});

fetchContacts();