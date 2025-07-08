## 🚨 **CARE – Critical AI Response Engine**

> **CARE** is an AI-powered emergency response platform designed to intelligently detect, classify, and coordinate responses to critical situations — such as medical emergencies, accidents, and public safety threats. The system ensures rapid, reliable, and context-aware assistance via mobile and web interfaces, leveraging AI, geolocation, and real-time communication technologies.

---

### 🧠 What is CARE?

**CARE** stands for **Critical AI Response Engine**, a cross-platform emergency management solution that integrates:

- 📱 **Mobile App** *(React Native + NativeWind)* for panic-mode emergency calls and location sharing  
- 🧭 **AI Incident Classification Engine** – understands user context via voice, text, or image  
- 🛰 **Responder Dashboard** *(React + Tailwind CSS)* – for real-time dispatch & live incident tracking  
- 🌐 **Geolocation & Routing** – suggests optimal responder paths and tracks incidents live  
- 🔗 **Secure API Layer** *(FastAPI + RabbitMQ)* – handles role-based comms & real-time updates  

---

### 💡 Key Features

#### 🧍‍♀️ For General Users (Mobile App)
- 🆘 **Panic Mode** – one-tap emergency triggering  
- 🎙️ **Voice/Text-based Input** – AI auto-classifies emergencies  
- 📍 **Live Location Sharing** – real-time tracking by responders  
- 🔕 **Discreet Mode** – silent/stealth triggers for high-risk cases  
- 🧑‍🤝‍🧑 **Community Alert System** – notifies nearby trusted individuals  

#### 🚓 For Emergency Responders
- 📊 **Incident Dashboard** – live map with filters  
- 📡 **Auto-assignment** – nearest responder unit dispatch  
- 📂 **Document Uploads** – bills, reports, medical records  
- ⚠️ **Push/SMS Alerts** – real-time notifications  
- 📈 **Analytics** – response time & success rate tracking  

---

### 🔧 AI Capabilities
- 🤖 **NLP Classification** – detects type of emergency from text, voice, image  
- 🧠 **On-device AI Fallback** – handles offline classification on the edge  
- 🎯 **Dynamic Priority Scoring** – ranks incidents based on severity, context, location  


## 📸 **Snippets:**

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/1a2bea2e-64a0-4312-bbae-33fc8281e225" width="250"/></td>
     <td><img src="https://github.com/user-attachments/assets/975e654f-7f5b-4b0f-80cb-470b11aabbb3" width="250"/></td>
    <td><img src="https://github.com/user-attachments/assets/8a23f77d-97ba-41be-88ae-6192c610a679" width="250"/></td>
  </tr>
  <tr>
       <td><img src="https://github.com/user-attachments/assets/7dc0fd16-a7c3-4571-b9d9-f9ad15db41c4" width="250"/></td>
    <td><img src="https://github.com/user-attachments/assets/06c1bef4-f2fc-4b87-a3cd-7a86a9ebf5eb" width="250"/></td>
    <td><img src="https://github.com/user-attachments/assets/f9e1a229-a1c4-492f-9b57-48e5967a1d35" width="250"/></td>
  </tr>
</table>

## **Admin Dashboard:**
![image](https://github.com/user-attachments/assets/53206a51-9fc0-4985-adac-9ffaf7843729)
![image](https://github.com/user-attachments/assets/d1294f3c-a469-4c5f-ae23-6a96f2a0ab56)
![image](https://github.com/user-attachments/assets/0c34871c-4e0b-431b-bd45-1497c5c9153e)


## 📦 **Tech Stack**

### 🧑‍💼 **User App (Mobile)**
- **Framework:** [React Native](https://reactnative.dev/), [Expo](https://expo.dev/)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)

### 🚨 **Responder Dashboard (Web)**
- **Framework:** [React](https://reactjs.org/)
- **Styling & Maps:** [Tailwind CSS](https://tailwindcss.com/), [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)

### 🧠 **AI Layer**
- **Models & Pipelines:** [HuggingFace Transformers](https://huggingface.co/transformers/)

### 🔧 **Backend**
- **API Framework:** [FastAPI](https://fastapi.tiangolo.com/), [Node.js](https://nodejs.org/docs)
- **Realtime:** WebSockets
- **Message Broker:** [RabbitMQ](https://www.rabbitmq.com/)]

### 🗄️ **Database**
- **Primary DB:** [PostgreSQL](https://www.postgresql.org/)
- **Geo Queries:** [PostGIS](https://postgis.net/) for spatial data support

