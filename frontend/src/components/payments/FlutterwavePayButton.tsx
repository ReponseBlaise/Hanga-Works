import { useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – flutterwave-react-v3 ships its own types but declaration may vary
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

type FlutterWaveResponse = {
	status: string;
	tx_ref: string;
	transaction_id: number;
	[key: string]: unknown;
};

type Props = {
	courseId: string;
	courseTitle: string;
	amount: number;
	currency: string;
	user: { email: string; name: string; phone?: string | null };
	onSuccess: (data: { txRef: string; transactionId: string }) => void;
	onClose?: () => void;
	disabled?: boolean;
	className?: string;
	label?: string;
};

export function FlutterwavePayButton({
	courseId,
	courseTitle,
	amount,
	currency,
	user,
	onSuccess,
	onClose,
	disabled,
	className = 'button button-primary',
	label,
}: Props) {
	const txRef = useRef(`hw-${courseId}-${Date.now()}-0`);

	const config = {
		public_key: (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string) ?? '',
		tx_ref: txRef.current,
		amount: Math.max(0, amount),
		currency: currency ?? 'RWF',
		payment_options: 'card,mobilemoney,ussd',
		customer: {
			email: user.email,
			phone_number: user.phone ?? '',
			name: user.name,
		},
		customizations: {
			title: 'Hanga Works',
			description: `Enrollment: ${courseTitle}`,
			logo: '',
		},
	};

	const handleFlutterPayment = useFlutterwave(config);

	return (
		<button
			type="button"
			className={className}
			disabled={disabled}
			onClick={() => {
				handleFlutterPayment({
					callback: (response: FlutterWaveResponse) => {
						closePaymentModal();
						const status = response.status?.toLowerCase?.();
						if (status === 'successful' || status === 'success') {
							const txRefValue = response.tx_ref || (response as any).txRef || txRef.current;
							const transactionIdValue = String(response.transaction_id ?? (response as any).transactionId ?? '');
							if (txRefValue && transactionIdValue) {
								onSuccess({
									txRef: txRefValue,
									transactionId: transactionIdValue,
								});
							}
						}
					},
					onclose: () => {
						onClose?.();
					},
				});
			}}
		>
			{label ?? `Pay ${currency} ${amount?.toLocaleString()} & Enroll`}
		</button>
	);
}
