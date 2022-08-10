import React from 'react'
import Vonny from './Vonny.jpg'
import Hedwig from './Hedwig.jpg'
import Suilyana from './Suilyana.jpeg'
import Stella from './Stella.jpg'

function About() {
  return (
    <div className='container'>
        <div class="wpb_wrapper">
<h1 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>About Us</h1>
<div >
<p>CMC Learning Tree adalah institusi tumbuh kembang anak yang memiliki visi peduli dan membantu agar anak mampu mencapai tumbuh kembang secara optimal.</p>
<p>Kami menyediakan layanan secara holistik dan interdisiplin, dimana klien kami akan diobservasi dan mendapat intervensi dari berbagai aspek. Kami juga melibatkan orangtua (caregivers)sebagai partner kami dalam menerapkan program latihan untuk anak di rumah. Jadi terapi dapat diberikan secara berkelanjutan.</p>
</div>
		</div>
    <div>
    <h1 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
        Inilah Tim Kami
    </h1>
    </div>
    <div style={{display:'flex', justifyContent:'space-between'}}>
        <div style={{paddingLeft:'0.5em', paddingRight:'0.2em', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            <img src={Vonny} style={{width:'230px',height:'280px'}}></img>
            <h3>Vonny Susanty</h3>
            <p  style={{padding:'0.5em'}}>Pendidikan Formal 1993 – 1997: Sarjana Psikologi, UNIKA Soegijapranata, Semarang 2004</p>
        </div>
        <div style={{display:'flex',  paddingRight:'0.2em', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            <img src={Stella} style={{width:'260px',height:'280px'}}></img>
            <h3>Stella Rosalina P</h3>
            <p  style={{padding:'0.5em'}}>Pendidikan Formal 2009–2013: Sarjana Psikologi, Universitas Katolik Atmajaya</p>
        </div>
        <div style={{display:'flex',  paddingRight:'0.2em', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            <img src={Suilyana} style={{width:'270px',height:'280px'}}></img>
            <h3>Suilyana O. Sewucipto</h3>
            <p style={{padding:'0.5em'}}>Pendidikan Formal 1999-2000: Psychology Certification Programme, Unika Soegijapranata, Semarang</p>
        </div>
        <div style={{paddingRight:'0.5em', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            <img src={Hedwig} style={{width:'250px',height:'280px'}}></img>
            <h3>Hedwig Emiliana Tulus</h3>
            <p  style={{padding:'0.5em'}}>Pendidikan Formal 1991-1998 : Bachelor of Engineering, Atma Jaya Catholic University, Jakarta</p>
        </div>
    </div>
    <h1 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
        Location
    </h1>
    <div style={{display:'flex', justifyContent:'space-evenly'}}>
        <div>
        <h4 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>Head Office</h4>
        <div style={{justifyContent:'center', alignItems:'center', display:'flex', flexDirection:'column'}}>
        <p style={{width:'60%'}}>Jl. Taman Permata Meruya Plaza II Blok A-16, Meruya Ilir, Jakarta 11620.</p>
        <p>Email: cmc_meruya@yahoo.com</p>
        <p>Phone: 021 5860028</p>
        <p>Whatsapp: 0815 7474 9988</p>
        </div>
        </div>
        <div>
            <h4 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>Branch Office</h4>
            <div style={{justifyContent:'center', alignItems:'center', display:'flex', flexDirection:'column'}}>
            <p style={{width:'60%'}}>Ruko Elang Laut Blok A-23, Jl. Pantai Indah Selatan 1, Pantai Indah Kapuk, Jakarta 144460.</p>
            <p>Email: cmc_pik@yahoo.com</p>
            <p>Phone: 021 29032523</p>
            <p>Whatsapp: 0857 7673 3059</p>
            </div>
        </div>
    </div>
    </div>
  )
}

export default About