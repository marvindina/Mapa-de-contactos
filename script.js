document.addEventListener('DOMContentLoaded', () => {
    // Webhook confirmado: https://hooks.zapier.com/hooks/catch/24169034/uatxzvp/
    const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/24169034/uatxzvp/';
    
    const form = document.getElementById('application-form');
    const contactsTableBody = document.getElementById('contacts-table-body');
    const addContactBtn = document.getElementById('add-contact-btn');
    const submitBtn = document.getElementById('submit-btn');
    const btnSpinner = document.getElementById('btn-spinner');
    const btnText = document.getElementById('btn-text');
    const contactCounter = document.getElementById('contact-counter');

    let contactCount = 10; 
    const MAX_CONTACTS = 15;

    const relations = ["Familiar", "Amigo cercano", "Compañero actual", "Excompañero", "Cliente anterior", "Conocido social", "Entrenador/Maestro", "Profesional", "Otro"];
    const trusts = ["1 (Baja)", "2", "3", "4", "5 (Alta)"];
    const optionsYesNo = ["Sí", "Probablemente sí", "No estoy seguro", "No"];

    const updateCounter = () => {
        if (contactCounter) {
            contactCounter.textContent = `${contactCount} de ${MAX_CONTACTS} Requeridos`;
        }
    };

    // Función para crear una fila nueva dinámicamente
    const createRow = (index) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors animate-fade-in";
        tr.innerHTML = `
            <td class="p-3 text-center text-slate-400 font-medium">${index + 1}</td>
            <td class="p-2"><input type="text" name="contacts[${index}][name]" placeholder="Nombre completo" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"></td>
            <td class="p-2"><select name="contacts[${index}][relation]" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"><option value="" disabled selected>Relación</option>${relations.map(r => `<option value="${r}">${r}</option>`).join('')}</select></td>
            <td class="p-2"><input type="text" name="contacts[${index}][occupation]" placeholder="Ocupación" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"></td>
            <td class="p-2"><select name="contacts[${index}][trust]" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"><option value="" disabled selected>-</option>${trusts.map(t => `<option value="${t}">${t}</option>`).join('')}</select></td>
            <td class="p-2"><select name="contacts[${index}][availability]" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"><option value="" disabled selected>Seleccione opción</option>${optionsYesNo.map(o => `<option value="${o}">${o}</option>`).join('')}</select></td>
        `;
        return tr;
    };

    // Lógica para agregar más contactos opcionales (Max 15)
    addContactBtn.addEventListener('click', () => {
        if (contactCount < MAX_CONTACTS) {
            contactsTableBody.appendChild(createRow(contactCount));
            contactCount++;
            updateCounter();
        }
        if (contactCount >= MAX_CONTACTS) {
            addContactBtn.style.display = 'none';
        }
    });

    // Manejo del envío al Webhook
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        // Objeto principal plano (Flat JSON structure)
        const payload = {
            email_candidato: formData.get('email'),
            utm_source: formData.get('utm_source') || '',
            utm_medium: formData.get('utm_medium') || '',
            utm_campaign: formData.get('utm_campaign') || '',
            total_contactos_enviados: 0
        };

        let validContacts = 0;

        // Recolectar datos de todas las filas y aplanarlos
        for (let i = 0; i < contactCount; i++) {
            const name = formData.get(`contacts[${i}][name]`);
            const relation = formData.get(`contacts[${i}][relation]`);
            const occupation = formData.get(`contacts[${i}][occupation]`);
            const trust = formData.get(`contacts[${i}][trust]`);
            const availability = formData.get(`contacts[${i}][availability]`);

            // Si tiene nombre, lo consideramos un contacto para el payload
            if (name && name.trim() !== "") {
                const num = validContacts + 1;
                payload[`contacto_nombre_${num}`] = name;
                payload[`contacto_relacion_${num}`] = relation || '';
                payload[`contacto_ocupacion_${num}`] = occupation || '';
                payload[`contacto_confianza_${num}`] = trust || '';
                payload[`contacto_disponibilidad_${num}`] = availability || '';
                validContacts++;
            }
        }

        payload.total_contactos_enviados = validContacts;

        // Validar mínimo de 10 contactos
        if (validContacts < 10) {
            alert("Por favor completa la información de al menos 10 contactos para poder continuar.");
            return;
        }

        // Estado visual de carga
        submitBtn.disabled = true;
        btnText.textContent = "Enviando...";
        btnSpinner.classList.remove('hidden');

        try {
            // Envío de datos al webhook de Zapier (Flat JSON)
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 
                    'Content-Type': 'application/json'
                }
            });
            
            // Éxito: Mostrar pantalla de agradecimiento
            form.classList.add('hidden');
            document.getElementById('intro-card').classList.add('hidden');
            document.getElementById('view-thank-you').classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Error al enviar al webhook:", error);
            // Intento sin CORS como respaldo para Zapier
            try {
                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' }
                });
                form.classList.add('hidden');
                document.getElementById('intro-card').classList.add('hidden');
                document.getElementById('view-thank-you').classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                alert("Hubo un error de conexión al enviar el formulario. Por favor revisa tu conexión e intenta de nuevo.");
                submitBtn.disabled = false;
                btnText.textContent = "Enviar Formulario";
                btnSpinner.classList.add('hidden');
            }
        }
    });

    // Año dinámico en el footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});