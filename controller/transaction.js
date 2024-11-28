const { Connection, PublicKey, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const PointTransaction = require('../model/PointTransaction');
const bs58 = require('bs58').default || require('bs58');

const User = require('../model/User');



const transactionController = {
    
    redeem: async (req, res) => {
        const connection = new Connection(process.env.SOLANA_NETWORK, 'confirmed');
        const { points, userPublicKey, userId } = req.body;

        if (!points || !userPublicKey || !req.user.userId) {
            return res.status(400).json({ error: 'Missing points, userPublicKey, or userId' });
        }
    
        try {
            // Tính số SOL từ điểm
            const SOL_AMOUNT = points / 10000; // Ví dụ: 10000 điểm đổi lấy 1 SOL
            const lamports = SOL_AMOUNT * LAMPORTS_PER_SOL;

            if(points < 100){
                return res.status(400).json({ error: 'Points must enought 100' });
            }

            const user = await User.findById(req.user.userId);
            if(!user){
                return res.status(400).json({ error: 'User is not found' });
            }

            if(user.point < points){
                return res.status(400).json({ error: 'Your points not enought' });
            }


    
            // Chuyển đổi từ Base58 sang Uint8Array cho secret key
            const adminSecretKey = bs58.decode(process.env.ADMIN_SECRET_KEY);
            const adminWallet = Keypair.fromSecretKey(adminSecretKey);
    
            // Tạo một giao dịch mới
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: adminWallet.publicKey,
                    toPubkey: new PublicKey(user.publicKey),
                    lamports: lamports,
                })
            );
    
            // Gửi và xác nhận giao dịch
            const signature = await connection.sendTransaction(transaction, [adminWallet]);
            await connection.confirmTransaction(signature, 'confirmed');


            user.point = user.point - points;

            await user.save();
    
            // Lưu giao dịch vào database với trạng thái 'completed' và thêm chữ ký giao dịch
            const newTransaction = new PointTransaction({
                userId: req.user.userId,
                points: points,
                solAmount: SOL_AMOUNT,
                transactionSignature: signature,
                status: 'completed',
            });
    
            await newTransaction.save();
    
            res.status(200).json({ message: 'Redeem successful', signature });
        } catch (error) {
            console.error('Error redeeming points:', error);
            res.status(500).json({ error: 'Failed to redeem points', details: error.message });
        }
}

}


module.exports = transactionController;