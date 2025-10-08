import { clerkClient } from "@clerk/express";

// we are using this bcs we are creating ai usage in terms of credits....
// so metadata hepls use to check users credits....
export const auth = async (req, res, next) => {
    try {
        const {userId, has} = await req.auth();
        const hasPremiumPlan = await has({plan: "premium"})

        // we have used getUser to access metadata....
        const user = await clerkClient.users.getUser(userId);

        // means if the user is free and still has free credits left....
        if(!hasPremiumPlan && user.privateMetadata.free_usage) {
            req.free_usage = user.privateMetadata.free_usage;
            // else is User has a premium plan OR User is free but has no remaining free usage....
        } else {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });
            req.free_usage = 0;
        }

        req.plan = hasPremiumPlan ? "premium" : "free";
        next();
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}