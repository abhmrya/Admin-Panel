await Guard.guest();

const API_BASE="/api/v1/auth";


function showAlert(message,type="error"){

const box=document.getElementById("alertBox");
const inner=document.getElementById("alertInner");


const styles={
error:"bg-red-50 border-red-200 text-red-700",
success:"bg-green-50 border-green-200 text-green-700",
};


inner.className="rounded-md border px-4 py-3 text-sm flex items-start justify-between gap-3 "+styles[type];


inner.innerHTML=`
<span>${message}</span>
<button onclick="document.getElementById('alertBox').classList.add('hidden')">
✕
</button>
`;


box.classList.remove("hidden");

}



function clearFieldErrors(){

document.querySelectorAll(".field-error").forEach(el=>{

el.classList.add("hidden");
el.textContent="";

});

}



document
.getElementById("registerForm")
.addEventListener("submit",async(e)=>{


e.preventDefault();


clearFieldErrors();

document.getElementById("alertBox").classList.add("hidden");


const btn=document.getElementById("submitBtn");

btn.disabled=true;
btn.textContent="Creating...";



const payload={

username:
document.getElementById("username").value.trim(),

email:
document.getElementById("email").value.trim(),

first_name:
document.getElementById("first_name").value.trim(),

last_name:
document.getElementById("last_name").value.trim(),

password:
document.getElementById("password").value,


confirm_password:
document.getElementById("confirm_password").value

};




try{


const response=await fetch(`${API_BASE}/register/`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(payload)

});



const data=await response.json();



if(!response.ok){


let errorShown=false;


Object.keys(data).forEach(field=>{


const errorElement=
document.querySelector(
`.field-error[data-field="${field}"]`
);



if(errorElement){


errorElement.textContent=
Array.isArray(data[field])
?data[field][0]
:data[field];


errorElement.classList.remove("hidden");

errorShown=true;

}


});



if(!errorShown){

showAlert(
data.detail || "Registration failed."
);

}


return;


}




showAlert(
"Registration successful! Redirecting to login...",
"success"
);



setTimeout(()=>{

window.location.href="/login/";

},1200);



}

catch(error){


showAlert(
"Server se connect nahi ho paya."
);


}



finally{


btn.disabled=false;

btn.textContent="Create Account";


}



});