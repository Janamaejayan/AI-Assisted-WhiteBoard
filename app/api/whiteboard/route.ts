import { db, WhiteBoardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";


export async function POST (req : NextRequest){
    const {projectId, elements, files, appState} = await req.json();
    const user = await currentUser();

    if (!user){
        return NextResponse.json("Unauthorized user");
    }

    if (projectId){

        try{

            const result = await db.insert(WhiteBoardData).values({
                projectId : projectId,
                elements: elements,
                appState: appState,
                files: files
            }).onConflictDoUpdate({
                target: WhiteBoardData.projectId,
                set: {
                    elements: elements,
                    appState: appState,
                    files: files,
                    updatedAt: new Date(),
                }
            });
            
            return NextResponse.json(result);
        }catch(e){
            return NextResponse.json('Project info missing');
        }

    }
}

export async function GET(req: NextRequest) {

    const user = await currentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized user" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
        return NextResponse.json(
            { error: "Project info missing" },
            { status: 400 }
        );
    }

    const result = await db
        .select()
        .from(WhiteBoardData)
        .where(eq(WhiteBoardData.projectId, projectId));

    return NextResponse.json(result[0] || null);
}