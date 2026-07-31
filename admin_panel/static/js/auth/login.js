const API_BASE="/api/v1/auth";

function showAlert(message,type="error"){
    const box=document.getElementById("alertBox");
    const inner=document.getElementById("alertInner");

    const styles={
        error:"bg-red-50 border-red-200 text-red-700",
        success:"bg-green-50 border-green-200 text-green-700",
    };

    inner.className="rounded-md border px-4 py-3 text-sm flex items-start justify-between gap-3 "+styles[type];
    inner.innerHTML=`<span>${message}</span><button onclick="document.getElementById('alertBox').classList.add('hidden')" class="opacity-60 hover:opacity-100">✕</button>`;
    box.classList.remove("hidden");
}

function clearFieldErrors(){
    document.querySelectorAll(".field-error").forEach(el=>{
        el.classList.add("hidden");
        el.textContent="";
    });
}

document.getElementById("loginForm").addEventListener("submit",async(e)=>{
    e.preventDefault();

    clearFieldErrors();
    document.getElementById("alertBox").classList.add("hidden");

    const submitBtn=document.getElementById("submitBtn");
    submitBtn.disabled=true;
    submitBtn.textContent="Logging in...";

    const payload={
        email:document.getElementById("email").value.trim(),
        password:document.getElementById("password").value,
    };

    try{
        const res=await fetch(`${API_BASE}/login/`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(payload),
        });

        const data=await res.json();

        if(!res.ok){
            let shownFieldError=false;

            Object.keys(data).forEach(field=>{
                const el=document.querySelector(`.field-error[data-field="${field}"]`);

                if(el){
                    el.textContent=Array.isArray(data[field])?data[field][0]:data[field];
                    el.classList.remove("hidden");
                    shownFieldError=true;
                }
            });

            if(!shownFieldError){
                showAlert(data.detail||"Email ya password galat hai.");
            }

            return;
        }

        localStorage.setItem("access_token",data.tokens.access);
        localStorage.setItem("refresh_token",data.tokens.refresh);
        localStorage.setItem("user",JSON.stringify(data.user));

        showAlert("Login successful!","success");

        setTimeout(()=>{
            window.location.href="/dashboard/";
        },800);

    }catch(error){
        showAlert("Server se connect nahi ho paya. Baad me try karo.");
    }finally{
        submitBtn.disabled=false;
        submitBtn.textContent="Login";
    }
});