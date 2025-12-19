document.addEventListener('DOMContentLoaded', () => {
    const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/24169034/uatxzvp/';
    const form = document.getElementById('application-form');
    const contactsTableBody = document.getElementById('contacts-table-body');
    const addContactBtn = document.getElementById('add-contact-btn');
    const submitBtn = document.getElementById('submit-btn');
    const btnSpinner = document.getElementById('btn-spinner');
    const btnText = document.getElementById('btn-text');

    let contactCount = 10; // Empezamos en 10 porque ya están en el HTML

    const relations = ["Familiar", "Amigo cercano", "Compañero actual", "Excompañero", "Cliente anterior", "Conocido social", "Entrenador/Maestro", "Profesional", "Otro"];
    const trusts = ["1 (Baja)", "2", "3", "4", "5 (Alta)"];
    const optionsYesNo = ["Sí", "Probablemente sí", "No estoy seguro", "No"];

    // Función para crear una fila nueva
    const createRow = (index) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors animate-fade-in";
        tr.innerHTML = `
            <td class="p-3 text-center text-slate-400 font-medium">${index + 1}</td>
            <td class="p-2"><input type="text" name="contacts[${index}][name]" placeholder="Nombre" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"></td>
            <td class="p-2"><select name="contacts[${index}][relation]" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"><option value="" disabled selected>Relación</option>${relations.map(r => `<option value="${r}">${r}</option>`).join('')}</select></td>
            <td class="p-2"><input type="text" name="contacts[${index}][occupation]" placeholder="Ocupación" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"></td>
            <td class="p-2"><select name="contacts[${index}][trust]" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"><option value="" disabled selected>-</option>${trusts.map(t => `<option value="${t}">${t}</option>`).join('')}</select></td>
            <td class="p-2"><select name="contacts[${index}][availability]" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#FFB300] outline-none"><option value="" disabled selected>¿Toma llamada o responde msj?</option>${optionsYesNo.map(o => `<option value="${o}">${o}</option>`).join('')}</select></td>
        `;
        return tr;
    };

    // Agregar filas opcionales
    addContactBtn.addEventListener('click', () => {
        contactsTableBody.appendChild(createRow(contactCount));
        contactCount++;
        if (contactCount >= 50) addContactBtn.style.display = 'none';
    });

    // Envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const payload = {
            email: formData.get('email'),
            contactos: []
        };

        // Recolectar datos de todas las filas que tengan nombre
        for (let i = 0; i < contactCount; i++) {
            const name = formData.get(`contacts[${i}][name]`);
            if (name && name.trim() !== "") {
                payload.contactos.push({
                    nombre: name,
                    relacion: formData.get(`contacts[${i}][relation]`),
                    ocupacion: formData.get(`contacts[${i}][occupation]`),
                    confianza: formData.get(`contacts[${i}][trust]`),
                    disponibilidad_llamada_msj: formData.get(`contacts[${i}][availability]`)
                });
            }
        }

        if (payload.contactos.length < 10) {
            alert("Por favor completa al menos 10 contactos.");
            return;
        }

        submitBtn.disabled = true;
        btnText.textContent = "Enviando...";
        btnSpinner.classList.remove('hidden');

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
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al enviar. Por favor intenta de nuevo.");
            submitBtn.disabled = false;
            btnText.textContent = "Enviar Mapa de Contactos";
            btnSpinner.classList.add('hidden');
        }
    });

    // Set current year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});