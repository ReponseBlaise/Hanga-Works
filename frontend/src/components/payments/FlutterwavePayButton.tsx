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
		amount,
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
						if (response.status === 'successful') {
							onSuccess({
								txRef: response.tx_ref,
								transactionId: String(response.transaction_id),
							});
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
