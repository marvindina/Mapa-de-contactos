document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/24169034/uatxzvp/';
    const MIN_CONTACTS = 10;
    const INITIAL_ROWS = 15;
    const STRONG_PROFILE_THRESHOLD = 15;

    // --- DOM Elements ---
    const form = document.getElementById('application-form');
    const viewThankYou = document.getElementById('view-thank-you');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const btnSpinner = document.getElementById('btn-spinner');
    const contactsTableBody = document.getElementById('contacts-table-body');
    const addContactBtn = document.getElementById('add-contact-btn');
    
    // --- Set Year ---
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- UTM Parsing ---
    const params = new URLSearchParams(window.location.search);
    const getParam = (key) => params.get(key) || params.get(key.toUpperCase()) || params.get(key.charAt(0).toUpperCase() + key.slice(1)) || '';
    
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    setVal('utm_source', getParam('utm_source'));
    setVal('utm_medium', getParam('utm_medium'));
    setVal('utm_campaign', getParam('utm_campaign') || getParam('utm_campaing'));
    setVal('utm_term', getParam('utm_term'));
    setVal('utm_content', getParam('utm_content'));
    setVal('utm_adset', getParam('utm_adset'));

    // --- Render Contact Rows ---
    let contactCount = 0;

    const renderContactRow = (index, isRequired) => {
        const rowId = `contact-${index}`;
        const requiredAttr = isRequired ? 'required' : '';
        const requiredPlaceholder = isRequired ? '*' : '';

        // Safely create the TR element
        const tr = document.createElement('tr');
        tr.id = rowId;
        tr.className = "hover:bg-slate-50 transition-colors group";

        // InnerHTML for the cells
        tr.innerHTML = `
            <td class="p-3 text-center align-middle font-medium text-slate-400 group-hover:text-[#FFB300]">
                ${index + 1}
            </td>
            <td class="p-3 align-middle">
                <input type="text" name="contacts[${index}][name]" ${requiredAttr} placeholder="Nombre completo${requiredPlaceholder}" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FFB300] focus:border-[#FFB300] outline-none text-sm placeholder:text-slate-300">
            </td>
            <td class="p-3 align-middle">
                <select name="contacts[${index}][relation]" ${requiredAttr} class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FFB300] focus:border-[#FFB300] outline-none text-sm text-slate-700">
                    <option value="" disabled selected>Selecciona...</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Amigo cercano">Amigo cercano</option>
                    <option value="Compañero de trabajo actual">Compañero actual</option>
                    <option value="Excompañero">Excompañero</option>
                    <option value="Cliente anterior">Cliente anterior</option>
                    <option value="Conocido social">Conocido social</option>
                    <option value="Entrenador / Maestro">Entrenador/Maestro</option>
                    <option value="Contacto profesional">Profesional</option>
                    <option value="Otro">Otro</option>
                </select>
            </td>
            <td class="p-3 align-middle">
                <input type="text" name="contacts[${index}][occupation]" ${requiredAttr} placeholder="A qué se dedica${requiredPlaceholder}" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FFB300] focus:border-[#FFB300] outline-none text-sm placeholder:text-slate-300">
            </td>
            <td class="p-3 align-middle">
                <select name="contacts[${index}][trust]" ${requiredAttr} class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FFB300] focus:border-[#FFB300] outline-none text-sm text-slate-700">
                    <option value="" disabled selected>-</option>
                    <option value="1">1 (Baja)</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5 (Alta)</option>
                </select>
            </td>
            <td class="p-3 align-middle">
                <select name="contacts[${index}][message]" ${requiredAttr} class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FFB300] focus:border-[#FFB300] outline-none text-sm text-slate-700">
                    <option value="" disabled selected>-</option>
                    <option value="Sí">Sí</option>
                    <option value="Probablemente sí">Probablemente</option>
                    <option value="No estoy seguro">Inseguro</option>
                    <option value="No">No</option>
                </select>
            </td>
            <td class="p-3 align-middle">
                <select name="contacts[${index}][call]" ${requiredAttr} class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FFB300] focus:border-[#FFB300] outline-none text-sm text-slate-700">
                    <option value="" disabled selected>-</option>
                    <option value="Sí">Sí</option>
                    <option value="Probablemente">Probablemente</option>
                    <option value="Difícil">Difícil</option>
                    <option value="No">No</option>
                </select>
            </td>
            <td class="p-3 align-middle">
                <input type="text" name="contacts[${index}][why]" ${requiredAttr} placeholder="Razón${requiredPlaceholder}" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FFB300] focus:border-[#FFB300] outline-none text-sm placeholder:text-slate-300">
            </td>
        `;
        return tr;
    };

    // Ensure table body exists before appending
    if (contactsTableBody) {
        // Initialize rows
        for (let i = 0; i < INITIAL_ROWS; i++) {
            const isRequired = i < 10; // First 10 are required
            contactsTableBody.appendChild(renderContactRow(i, isRequired));
            contactCount++;
        }
    }

    // Add button handler
    if (addContactBtn && contactsTableBody) {
        addContactBtn.addEventListener('click', () => {
            // New rows are optional
            const newRow = renderContactRow(contactCount, false);
            contactsTableBody.appendChild(newRow);
            contactCount++;
            
            // Limit to avoid performance issues
            if (contactCount >= 50) {
                addContactBtn.style.display = 'none';
            }
        });
    }

    // --- Form Submission ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Gather Data
            const formData = new FormData(form);
            const email = formData.get('email');
            const contacts = [];
            const flatContacts = {};

            // Iterate using count
            for (let i = 0; i < contactCount; i++) {
                const nameKey = `contacts[${i}][name]`;
                const name = formData.get(nameKey);
                
                // Only process if name has a value
                if (name && name.trim() !== '') {
                    const contactObj = {
                        nombre: name,
                        ocupacion: formData.get(`contacts[${i}][occupation]`),
                        relacion: formData.get(`contacts[${i}][relation]`),
                        nivel_confianza: formData.get(`contacts[${i}][trust]`),
                        contesta_mensaje: formData.get(`contacts[${i}][message]`),
                        toma_llamada: formData.get(`contacts[${i}][call]`),
                        razon_inclusion: formData.get(`contacts[${i}][why]`)
                    };
                    contacts.push(contactObj);

                    // Flatten for Zapier
                    const flatIndex = i + 1;
                    flatContacts[`contacto_${flatIndex}_nombre`] = contactObj.nombre;
                    flatContacts[`contacto_${flatIndex}_ocupacion`] = contactObj.ocupacion;
                    flatContacts[`contacto_${flatIndex}_relacion`] = contactObj.relacion;
                    flatContacts[`contacto_${flatIndex}_nivel_confianza`] = contactObj.nivel_confianza;
                    flatContacts[`contacto_${flatIndex}_contesta_mensaje`] = contactObj.contesta_mensaje;
                    flatContacts[`contacto_${flatIndex}_toma_llamada`] = contactObj.toma_llamada;
                    flatContacts[`contacto_${flatIndex}_razon_inclusion`] = contactObj.razon_inclusion;
                }
            }

            // 2. Validate
            const totalContacts = contacts.length;
            
            if (totalContacts < MIN_CONTACTS) {
                alert(`Por favor completa al menos ${MIN_CONTACTS} contactos.`);
                return;
            }

            let status = 'QUALIFIED';
            if (totalContacts > STRONG_PROFILE_THRESHOLD) {
                status = 'STRONG_PROFILE';
            }

            // 3. Construct Payload
            const payload = {
                email: email,
                total_contactos: totalContacts,
                status_filtro: status,
                ...flatContacts,
                lista_contactos: contacts,

                utm: {
                    utm_source: document.getElementById('utm_source')?.value || '',
                    utm_medium: document.getElementById('utm_medium')?.value || '',
                    utm_campaign: document.getElementById('utm_campaign')?.value || '',
                    utm_adset: document.getElementById('utm_adset')?.value || '',
                    utm_content: document.getElementById('utm_content')?.value || '',
                    utm_term: document.getElementById('utm_term')?.value || ''
                },

                metadata: {
                    user_agent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    form_type: "contact_map_level_a"
                }
            };

            // 4. Update UI
            submitBtn.disabled = true;
            btnText.textContent = 'Enviando...';
            btnIcon.classList.add('hidden');
            btnSpinner.classList.remove('hidden');

            // 5. Send
            try {
                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: {
                        'Content-Type': 'text/plain;charset=UTF-8'
                    }
                });
            } catch (error) {
                console.error('Webhook error:', error);
            }

            // 6. Transition
            await new Promise(resolve => setTimeout(resolve, 800));
            form.style.display = 'none';
            document.getElementById('intro-card').style.display = 'none';
            viewThankYou.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});