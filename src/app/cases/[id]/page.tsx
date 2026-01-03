import { getCurrentUser } from "@/actions/auth-actions";
import { getCaseById } from "@/features/cases/actions/case-actions";
import { notFound, redirect } from "next/navigation";
import { CaseDetailsView } from "@/features/cases/components/case-details-view";

export default async function CaseDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) redirect("/");

    const caseItem = await getCaseById(id);

    if (!caseItem) notFound();

    const isDoctor = user.role === 'doctor';
    const isAssignedDoctor = isDoctor && caseItem.assignedTo?.userId === user.id;

    // Pseudo-random data generator
    const getMockAiAnalysis = (id: string) => {
        let seed = 0;
        for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);
        const random = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };

        const diagnoses = ["Glioblastoma Multiforme", "Meningioma", "Astrocytoma", "Oligodendroglioma", "Pituitary Adenoma"];
        return {
            diagnosis: diagnoses[Math.floor(random() * diagnoses.length)],
            confidence: Math.floor(random() * (99 - 70) + 70),
            volume: (random() * (50 - 5) + 5).toFixed(1),
            lifeExpectancy: Math.floor(random() * (60 - 12) + 12)
        };
    };

    const aiData = getMockAiAnalysis(caseItem.id);

    return (
        <CaseDetailsView
            caseItem={caseItem}
            user={user}
            aiData={aiData}
            isDoctor={isDoctor}
            isAssignedDoctor={isAssignedDoctor}
        />
    );
}