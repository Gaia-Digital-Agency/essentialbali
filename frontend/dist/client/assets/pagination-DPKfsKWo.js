const s=(i,r)=>!r||r<1?[1]:r<=5?Array.from({length:r},(f,n)=>n+1):i<=3?[1,2,3,"...",r]:i>=r-2?[1,"...",r-2,r-1,r]:[1,"...",i-1,i,i+1,"...",r];export{s as g};
