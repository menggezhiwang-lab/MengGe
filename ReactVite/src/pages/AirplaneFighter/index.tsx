import { useRef } from "react"; 

function Index(){
    const webGL = useRef<HTMLDivElement | null>(null);
    return (
        <>
            <div ref={webGL}>123</div>
        </>
    );
}

export default Index;