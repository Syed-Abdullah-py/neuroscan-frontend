export default function ScanViewer({ params }: { params: { id: string } }) {
    return (
        <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
            <h1 className="text-xl">DICOM Viewer - Scan {params.id}</h1>
        </div>
    );
}
